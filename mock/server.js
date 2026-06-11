const http = require('http');
const path = require('path');
const jsonServer = require('json-server');

const PORT = process.env.MOCK_API_PORT || 3004;
const MIN_PASSWORD_LENGTH = 12;
const TEMPORARY_PASSWORD_PREFIX = 'TempPass';

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

function buildUsername(firstName, lastName) {
  return `${firstName.trim()}.${lastName.trim()}`
    .toLowerCase()
    .replace(/\s+/g, '.');
}

function generateTemporaryPassword() {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${TEMPORARY_PASSWORD_PREFIX}${suffix}`;
}

function toPublicUser(user) {
  const {
    password: _password,
    ...publicUser
  } = user;

  return {
    id: publicUser.id,
    username: publicUser.username,
    displayName: publicUser.displayName,
    firstName: publicUser.firstName,
    lastName: publicUser.lastName,
    email: publicUser.email,
    phone: publicUser.phone,
    dateOfBirth: publicUser.dateOfBirth,
    address: publicUser.address,
    occupation: publicUser.occupation,
    avatarUri: publicUser.avatarUri ?? '',
    language: publicUser.language ?? 'en',
    hasNotificationsEnabled: Boolean(publicUser.hasNotificationsEnabled),
    isAdmin: Boolean(publicUser.isAdmin),
    mustSetupPassword: Boolean(publicUser.mustSetupPassword),
    createdAt: publicUser.createdAt,
  };
}

function getUserEntry(db, userId) {
  return db.get('users').find({ id: Number(userId) });
}

function validateProfilePayload(payload) {
  const firstName =
    typeof payload.firstName === 'string' ? payload.firstName.trim() : '';
  const lastName =
    typeof payload.lastName === 'string' ? payload.lastName.trim() : '';
  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  const phone = typeof payload.phone === 'string' ? payload.phone.trim() : '';
  const address =
    typeof payload.address === 'string' ? payload.address.trim() : '';

  if (!firstName) {
    return { error: 'First name cannot be empty.' };
  }

  if (!lastName) {
    return { error: 'Last name cannot be empty.' };
  }

  if (!email || !email.includes('@')) {
    return { error: 'Enter correct email address.' };
  }

  if (!phone) {
    return { error: 'Enter correct phone number.' };
  }

  if (!address) {
    return { error: 'Enter correct address.' };
  }

  return {
    firstName,
    lastName,
    email,
    phone,
    address,
  };
}

function getNextUserId(db) {
  const users = db.get('users').value();
  const maxId = users.reduce((currentMax, user) => Math.max(currentMax, user.id), 0);

  return maxId + 1;
}

function createEmptySchedule(userId) {
  return {
    userId,
    greeting: 'Good morning!',
    footerText: 'See you next time!',
    tasks: [],
    timelineItems: [],
  };
}

function getScheduleByUserId(db, userId) {
  const parsedUserId = Number(userId);

  if (!Number.isInteger(parsedUserId)) {
    return null;
  }

  return db.get('schedules').find({ userId: parsedUserId }).value() ?? null;
}

function findScheduleTask(db, userId, taskId) {
  const schedule = getScheduleByUserId(db, userId);

  if (!schedule) {
    return null;
  }

  return schedule.tasks.find((entry) => entry.id === taskId) ?? null;
}

function isCompletedTaskStatus(status) {
  return status === 'done' || status === 'late';
}

function getCurrentTimeLabel() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
}

function completeScheduleTask(db, userId, taskId) {
  const scheduleEntry = db
    .get('schedules')
    .find({ userId: Number(userId) });

  if (!scheduleEntry.value()) {
    return { statusCode: 404, error: 'Schedule not found.' };
  }

  const taskEntry = scheduleEntry.get('tasks').find({ id: taskId });

  if (!taskEntry.value()) {
    return { statusCode: 404, error: 'Task not found.' };
  }

  const task = taskEntry.value();

  if (isCompletedTaskStatus(task.status)) {
    return { statusCode: 200, task };
  }

  const completedStatus = task.completedStatus;

  if (!isCompletedTaskStatus(completedStatus)) {
    return {
      statusCode: 400,
      error: 'Task cannot be completed.',
    };
  }

  const updatedTask = {
    ...task,
    status: completedStatus,
    completedTime: getCurrentTimeLabel(),
  };

  taskEntry.assign(updatedTask).write();

  return { statusCode: 200, task: updatedTask };
}

function parseUserIdQuery(userId) {
  if (!userId) {
    return null;
  }

  const parsedUserId = Number(userId);

  if (!Number.isInteger(parsedUserId)) {
    return null;
  }

  return parsedUserId;
}

function parseRouteUserId(userId) {
  const parsedUserId = Number(userId);

  if (!Number.isInteger(parsedUserId)) {
    return null;
  }

  return parsedUserId;
}

function parseTimeToMinutes(time) {
  const match = /^(\d{2}):(\d{2})$/.exec(time);

  if (!match) {
    return null;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

function isValidTimeLabel(time) {
  return parseTimeToMinutes(time) !== null;
}

function getNextTaskId(tasks) {
  const maxId = tasks.reduce((currentMax, task) => {
    const numericId = Number(task.id);

    if (!Number.isFinite(numericId)) {
      return currentMax;
    }

    return Math.max(currentMax, numericId);
  }, 0);

  return String(maxId + 1);
}

function rebuildTimelineItems(tasks) {
  const sortedTasks = [...tasks].sort((leftTask, rightTask) => {
    const leftMinutes = parseTimeToMinutes(leftTask.time) ?? 0;
    const rightMinutes = parseTimeToMinutes(rightTask.time) ?? 0;

    return leftMinutes - rightMinutes;
  });

  const timelineItems = [];
  let lastTime = null;

  for (const task of sortedTasks) {
    if (task.time !== lastTime) {
      timelineItems.push({
        type: 'time',
        id: `time-${task.time.replace(':', '-')}`,
        time: task.time,
      });
      lastTime = task.time;
    }

    timelineItems.push({
      type: 'task',
      taskId: task.id,
    });
  }

  return timelineItems;
}

function validateTaskTimes(time, dueTime) {
  if (!isValidTimeLabel(time)) {
    return 'Starts at time is invalid.';
  }

  if (!isValidTimeLabel(dueTime)) {
    return 'Due at time is invalid.';
  }

  const startMinutes = parseTimeToMinutes(time);
  const dueMinutes = parseTimeToMinutes(dueTime);

  if (dueMinutes <= startMinutes) {
    return 'Due at must be after starts at.';
  }

  return null;
}

function validateFullTaskPayload(payload) {
  const title = typeof payload.title === 'string' ? payload.title.trim() : '';
  const description =
    typeof payload.description === 'string' ? payload.description.trim() : '';
  const detailDescription =
    typeof payload.detailDescription === 'string'
      ? payload.detailDescription.trim()
      : '';
  const time = typeof payload.time === 'string' ? payload.time.trim() : '';
  const dueTime =
    typeof payload.dueTime === 'string' ? payload.dueTime.trim() : '';

  if (!title) {
    return { error: 'Title cannot be empty.' };
  }

  if (!description) {
    return { error: 'Subtitle cannot be empty.' };
  }

  if (!detailDescription) {
    return { error: 'Description cannot be empty.' };
  }

  const timeError = validateTaskTimes(time, dueTime);

  if (timeError) {
    return { error: timeError };
  }

  return {
    title,
    description,
    detailDescription,
    time,
    dueTime,
  };
}

function getScheduleEntry(db, userId) {
  return db.get('schedules').find({ userId: Number(userId) });
}

function writeScheduleTasks(scheduleEntry, tasks) {
  scheduleEntry
    .assign({
      tasks,
      timelineItems: rebuildTimelineItems(tasks),
    })
    .write();
}

// Demo credentials (see mock/db.json): user.name / password1234
server.post('/login', (req, res) => {
  const { username, password } = req.body ?? {};

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required.' });
    return;
  }

  const db = router.db;
  const user = db.get('users').find({ username, password }).value();

  if (!user) {
    res.status(401).json({ error: 'Invalid username or password.' });
    return;
  }

  res.json({ user: toPublicUser(user) });
});

server.post('/setup-password', (req, res) => {
  const { username, temporaryPassword, password, confirmPassword } = req.body ?? {};

  if (!username || !temporaryPassword || !password || !confirmPassword) {
    res
      .status(400)
      .json({ error: 'Username, temporary password, and new password are required.' });
    return;
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    res.status(400).json({
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    });
    return;
  }

  if (password !== confirmPassword) {
    res.status(400).json({ error: 'Passwords must match.' });
    return;
  }

  const db = router.db;
  const userEntry = db.get('users').find({ username });

  if (!userEntry.value()) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const user = userEntry.value();

  if (!user.mustSetupPassword) {
    res.status(400).json({ error: 'Password setup is not required for this user.' });
    return;
  }

  if (user.password !== temporaryPassword) {
    res.status(401).json({ error: 'Invalid temporary password.' });
    return;
  }

  userEntry
    .assign({
      password,
      mustSetupPassword: false,
    })
    .write();

  res.json({
    user: toPublicUser({
      ...user,
      password,
      mustSetupPassword: false,
    }),
    message: 'Password has been set successfully.',
  });
});

server.post('/recover', (req, res) => {
  const { email } = req.body ?? {};

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    res.status(400).json({ error: 'A valid email address is required.' });
    return;
  }

  res.json({
    message:
      'If this email address is associated with an account, you will receive a password reset link shortly.',
  });
});

server.post('/admin/users', (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    dateOfBirth,
    address,
    occupation,
  } = req.body ?? {};

  const fields = {
    firstName,
    lastName,
    email,
    phone,
    dateOfBirth,
    address,
    occupation,
  };

  const missingField = Object.entries(fields).find(
    ([, value]) => typeof value !== 'string' || value.trim().length === 0,
  );

  if (missingField) {
    res.status(400).json({ error: 'All fields are required.' });
    return;
  }

  if (!email.includes('@')) {
    res.status(400).json({ error: 'A valid email address is required.' });
    return;
  }

  const db = router.db;
  const existingUsers = db.get('users').value();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = buildUsername(firstName, lastName);
  const hasExistingUser = existingUsers.some(
    (entry) =>
      entry.email?.toLowerCase() === normalizedEmail ||
      entry.username === normalizedUsername,
  );

  if (hasExistingUser) {
    res
      .status(409)
      .json({ error: 'A user with this email or username already exists.' });
    return;
  }

  const temporaryPassword = generateTemporaryPassword();
  const userId = getNextUserId(db);
  const user = {
    id: userId,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim(),
    phone: phone.trim(),
    dateOfBirth: dateOfBirth.trim(),
    address: address.trim(),
    occupation: occupation.trim(),
    username: normalizedUsername,
    displayName: `${firstName.trim()} ${lastName.trim()}`,
    password: temporaryPassword,
    avatarUri: '',
    language: 'en',
    hasNotificationsEnabled: false,
    isAdmin: false,
    mustSetupPassword: true,
    createdAt: new Date().toISOString(),
  };

  db.get('users').push(user).write();
  db.get('schedules').push(createEmptySchedule(userId)).write();

  res.status(201).json({
    user: toPublicUser(user),
    temporaryPassword,
    message:
      "New user has been created. Share the username and temporary password with the user.",
  });
});

server.get('/admin/users', (req, res) => {
  const db = router.db;
  const users = db
    .get('users')
    .value()
    .filter((entry) => !entry.isAdmin)
    .map((entry) => ({
      id: entry.id,
      displayName: entry.displayName,
      firstName: entry.firstName ?? '',
      lastName: entry.lastName ?? '',
      occupation: entry.occupation ?? '',
      avatarUri: entry.avatarUri ?? '',
    }))
    .sort((leftUser, rightUser) =>
      leftUser.displayName.localeCompare(rightUser.displayName),
    );

  res.json({ users });
});

server.post('/admin/schedules/:userId/tasks', (req, res) => {
  const db = router.db;
  const userId = parseRouteUserId(req.params.userId);

  if (userId === null) {
    res.status(400).json({ error: 'A valid userId is required.' });
    return;
  }

  const scheduleEntry = getScheduleEntry(db, userId);

  if (!scheduleEntry.value()) {
    res.status(404).json({ error: 'Schedule not found.' });
    return;
  }

  const validation = validateFullTaskPayload(req.body ?? {});

  if (validation.error) {
    res.status(400).json({ error: validation.error });
    return;
  }

  const schedule = scheduleEntry.value();
  const newTask = {
    id: getNextTaskId(schedule.tasks),
    time: validation.time,
    dueTime: validation.dueTime,
    title: validation.title,
    description: validation.description,
    detailDescription: validation.detailDescription,
    status: 'todo',
    completedStatus: 'done',
    completedMessage: 'Well done on time! 🎉',
  };

  const nextTasks = [...schedule.tasks, newTask];
  writeScheduleTasks(scheduleEntry, nextTasks);

  res.status(201).json({ task: newTask });
});

server.patch('/admin/schedules/:userId/tasks/:taskId', (req, res) => {
  const db = router.db;
  const userId = parseRouteUserId(req.params.userId);

  if (userId === null) {
    res.status(400).json({ error: 'A valid userId is required.' });
    return;
  }

  const scheduleEntry = getScheduleEntry(db, userId);

  if (!scheduleEntry.value()) {
    res.status(404).json({ error: 'Schedule not found.' });
    return;
  }

  const taskEntry = scheduleEntry.get('tasks').find({ id: req.params.taskId });

  if (!taskEntry.value()) {
    res.status(404).json({ error: 'Task not found.' });
    return;
  }

  const currentTask = taskEntry.value();
  const payload = req.body ?? {};
  const hasFullPayload =
    'title' in payload ||
    'description' in payload ||
    'detailDescription' in payload;

  let nextTask;

  if (hasFullPayload) {
    const validation = validateFullTaskPayload({
      title: payload.title ?? currentTask.title,
      description: payload.description ?? currentTask.description,
      detailDescription:
        payload.detailDescription ?? currentTask.detailDescription,
      time: payload.time ?? currentTask.time,
      dueTime: payload.dueTime ?? currentTask.dueTime,
    });

    if (validation.error) {
      res.status(400).json({ error: validation.error });
      return;
    }

    nextTask = {
      ...currentTask,
      title: validation.title,
      description: validation.description,
      detailDescription: validation.detailDescription,
      time: validation.time,
      dueTime: validation.dueTime,
    };
  } else {
    const nextTime =
      typeof payload.time === 'string' ? payload.time.trim() : currentTask.time;
    const nextDueTime =
      typeof payload.dueTime === 'string'
        ? payload.dueTime.trim()
        : currentTask.dueTime;
    const timeError = validateTaskTimes(nextTime, nextDueTime);

    if (timeError) {
      res.status(400).json({ error: timeError });
      return;
    }

    nextTask = {
      ...currentTask,
      time: nextTime,
      dueTime: nextDueTime,
    };
  }

  taskEntry.assign(nextTask).write();

  const updatedTasks = scheduleEntry
    .get('tasks')
    .value()
    .map((entry) => (entry.id === nextTask.id ? nextTask : entry));

  writeScheduleTasks(scheduleEntry, updatedTasks);

  res.json({ task: nextTask });
});

server.delete('/admin/schedules/:userId/tasks/:taskId', (req, res) => {
  const db = router.db;
  const userId = parseRouteUserId(req.params.userId);

  if (userId === null) {
    res.status(400).json({ error: 'A valid userId is required.' });
    return;
  }

  const scheduleEntry = getScheduleEntry(db, userId);

  if (!scheduleEntry.value()) {
    res.status(404).json({ error: 'Schedule not found.' });
    return;
  }

  const schedule = scheduleEntry.value();
  const hasTask = schedule.tasks.some((entry) => entry.id === req.params.taskId);

  if (!hasTask) {
    res.status(404).json({ error: 'Task not found.' });
    return;
  }

  const nextTasks = schedule.tasks.filter(
    (entry) => entry.id !== req.params.taskId,
  );

  writeScheduleTasks(scheduleEntry, nextTasks);

  res.status(204).send();
});

server.get('/profile', (req, res) => {
  const db = router.db;
  const userId = parseUserIdQuery(req.query.userId);

  if (userId === null) {
    res.status(400).json({ error: 'A valid userId query parameter is required.' });
    return;
  }

  const userEntry = getUserEntry(db, userId);

  if (!userEntry.value()) {
    res.status(404).json({ error: 'Profile not found.' });
    return;
  }

  res.json({ user: toPublicUser(userEntry.value()) });
});

server.patch('/profile', (req, res) => {
  const db = router.db;
  const userId = parseUserIdQuery(req.query.userId);

  if (userId === null) {
    res.status(400).json({ error: 'A valid userId query parameter is required.' });
    return;
  }

  const userEntry = getUserEntry(db, userId);

  if (!userEntry.value()) {
    res.status(404).json({ error: 'Profile not found.' });
    return;
  }

  const validation = validateProfilePayload(req.body ?? {});

  if (validation.error) {
    res.status(400).json({ error: validation.error });
    return;
  }

  const currentUser = userEntry.value();
  const updatedUser = {
    ...currentUser,
    firstName: validation.firstName,
    lastName: validation.lastName,
    email: validation.email,
    phone: validation.phone,
    address: validation.address,
    displayName: `${validation.firstName} ${validation.lastName}`,
  };

  userEntry.assign(updatedUser).write();

  res.json({ user: toPublicUser(updatedUser) });
});

server.patch('/profile/preferences', (req, res) => {
  const db = router.db;
  const userId = parseUserIdQuery(req.query.userId);

  if (userId === null) {
    res.status(400).json({ error: 'A valid userId query parameter is required.' });
    return;
  }

  const userEntry = getUserEntry(db, userId);

  if (!userEntry.value()) {
    res.status(404).json({ error: 'Profile not found.' });
    return;
  }

  const { language, hasNotificationsEnabled } = req.body ?? {};
  const updates = {};

  if (typeof language === 'string' && language.trim()) {
    updates.language = language.trim();
  }

  if (typeof hasNotificationsEnabled === 'boolean') {
    updates.hasNotificationsEnabled = hasNotificationsEnabled;
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: 'No valid preference fields provided.' });
    return;
  }

  const updatedUser = {
    ...userEntry.value(),
    ...updates,
  };

  userEntry.assign(updatedUser).write();

  res.json({ user: toPublicUser(updatedUser) });
});

server.post('/profile/avatar', (req, res) => {
  const db = router.db;
  const userId = parseUserIdQuery(req.query.userId);

  if (userId === null) {
    res.status(400).json({ error: 'A valid userId query parameter is required.' });
    return;
  }

  const userEntry = getUserEntry(db, userId);

  if (!userEntry.value()) {
    res.status(404).json({ error: 'Profile not found.' });
    return;
  }

  const { avatarUri } = req.body ?? {};

  if (typeof avatarUri !== 'string' || !avatarUri.trim()) {
    res.status(400).json({ error: 'A valid avatar URI is required.' });
    return;
  }

  const updatedUser = {
    ...userEntry.value(),
    avatarUri: avatarUri.trim(),
  };

  userEntry.assign(updatedUser).write();

  res.json({ user: toPublicUser(updatedUser) });
});

server.delete('/profile/avatar', (req, res) => {
  const db = router.db;
  const userId = parseUserIdQuery(req.query.userId);

  if (userId === null) {
    res.status(400).json({ error: 'A valid userId query parameter is required.' });
    return;
  }

  const userEntry = getUserEntry(db, userId);

  if (!userEntry.value()) {
    res.status(404).json({ error: 'Profile not found.' });
    return;
  }

  const updatedUser = {
    ...userEntry.value(),
    avatarUri: '',
  };

  userEntry.assign(updatedUser).write();

  res.json({ user: toPublicUser(updatedUser) });
});

server.get('/schedule', (req, res) => {
  const db = router.db;
  const userId = parseUserIdQuery(req.query.userId);

  if (userId === null) {
    res.status(400).json({ error: 'A valid userId query parameter is required.' });
    return;
  }

  const schedule = getScheduleByUserId(db, userId);

  if (!schedule) {
    res.status(404).json({ error: 'Schedule not found.' });
    return;
  }

  const { userId: _userId, ...scheduleResponse } = schedule;
  res.json(scheduleResponse);
});

server.get('/schedule/tasks/:taskId', (req, res) => {
  const db = router.db;
  const userId = parseUserIdQuery(req.query.userId);

  if (userId === null) {
    res.status(400).json({ error: 'A valid userId query parameter is required.' });
    return;
  }

  const task = findScheduleTask(db, userId, req.params.taskId);

  if (!task) {
    res.status(404).json({ error: 'Task not found.' });
    return;
  }

  res.json({ task });
});

server.patch('/schedule/tasks/:taskId/complete', (req, res) => {
  const db = router.db;
  const userId = parseUserIdQuery(req.query.userId);

  if (userId === null) {
    res.status(400).json({ error: 'A valid userId query parameter is required.' });
    return;
  }

  const result = completeScheduleTask(db, userId, req.params.taskId);

  if (result.error) {
    res.status(result.statusCode).json({ error: result.error });
    return;
  }

  res.status(result.statusCode).json({ task: result.task });
});

server.post('/reset-password', (req, res) => {
  const { password, confirmPassword } = req.body ?? {};

  if (!password || !confirmPassword) {
    res.status(400).json({ error: 'Password and confirmation are required.' });
    return;
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    res
      .status(400)
      .json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
    return;
  }

  if (password !== confirmPassword) {
    res.status(400).json({ error: 'Passwords must match.' });
    return;
  }

  res.json({ message: 'Password has been reset successfully.' });
});

server.use(router);

const httpServer = server.listen(PORT, () => {
  console.log(`Mock API running at http://localhost:${PORT}`);
});

function probeRecoverEndpoint() {
  return new Promise((resolve) => {
    const request = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/recover',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      (response) => {
        response.resume();
        resolve(response.statusCode);
      },
    );

    request.on('error', () => resolve(null));
    request.write(JSON.stringify({ email: 'health-check@example.com' }));
    request.end();
  });
}

httpServer.on('error', async (error) => {
  if (error.code === 'EADDRINUSE') {
    const recoverStatus = await probeRecoverEndpoint();

    if (recoverStatus === 200) {
      console.log(`Mock API already running at http://localhost:${PORT}`);
      process.exit(0);
      return;
    }

    console.error(
      `Port ${PORT} is in use by an outdated mock API (POST /recover returned ${recoverStatus ?? 'no response'}).`,
    );
    console.error(`Restart it with: npm run mock-api`);
    console.error(`Or stop the process manually: lsof -ti :${PORT} | xargs kill`);
    process.exit(1);
  }

  throw error;
});
