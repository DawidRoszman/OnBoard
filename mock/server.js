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
