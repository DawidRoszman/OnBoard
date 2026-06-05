const http = require('http');
const path = require('path');
const jsonServer = require('json-server');

const PORT = process.env.MOCK_API_PORT || 3004;
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Demo credentials (see mock/db.json): user.name / password1234 (12+ chars for client validation)
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

  const { password: _password, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
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
  const existingUsers = db.get('createdUsers').value();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = `${firstName.trim()}.${lastName.trim()}`
    .toLowerCase()
    .replace(/\s+/g, '.');
  const hasExistingUser = existingUsers.some(
    (user) =>
      user.email?.toLowerCase() === normalizedEmail ||
      user.username === normalizedUsername,
  );

  if (hasExistingUser) {
    res
      .status(409)
      .json({ error: 'A user with this email or username already exists.' });
    return;
  }

  const user = {
    id: existingUsers.length + 1,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim(),
    phone: phone.trim(),
    dateOfBirth: dateOfBirth.trim(),
    address: address.trim(),
    occupation: occupation.trim(),
    username: normalizedUsername,
    displayName: `${firstName.trim()} ${lastName.trim()}`,
    createdAt: new Date().toISOString(),
  };

  db.get('createdUsers').push(user).write();

  res.status(201).json({
    user,
    message:
      "New user has been created. Activation link has been sent to user's email address.",
  });
});

function getScheduleData(db) {
  return db.get('schedule').value();
}

function findScheduleTask(db, taskId) {
  const schedule = getScheduleData(db);

  if (!schedule) {
    return null;
  }

  const task = schedule.tasks.find((entry) => entry.id === taskId);

  if (!task) {
    return null;
  }

  return task;
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

function completeScheduleTask(db, taskId) {
  const taskEntry = db.get('schedule').get('tasks').find({ id: taskId });

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

server.get('/schedule', (req, res) => {
  const db = router.db;
  const schedule = getScheduleData(db);

  if (!schedule) {
    res.status(404).json({ error: 'Schedule not found.' });
    return;
  }

  res.json(schedule);
});

server.get('/schedule/tasks/:taskId', (req, res) => {
  const db = router.db;
  const task = findScheduleTask(db, req.params.taskId);

  if (!task) {
    res.status(404).json({ error: 'Task not found.' });
    return;
  }

  res.json({ task });
});

server.patch('/schedule/tasks/:taskId/complete', (req, res) => {
  const db = router.db;
  const result = completeScheduleTask(db, req.params.taskId);

  if (result.error) {
    res.status(result.statusCode).json({ error: result.error });
    return;
  }

  res.status(result.statusCode).json({ task: result.task });
});

server.post('/reset-password', (req, res) => {
  const { password, confirmPassword } = req.body ?? {};
  const MIN_PASSWORD_LENGTH = 12;

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
    console.error(
      `Restart it with: npm run mock-api`,
    );
    console.error(
      `Or stop the process manually: lsof -ti :${PORT} | xargs kill`,
    );
    process.exit(1);
  }

  throw error;
});
