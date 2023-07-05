const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(jsonServer.bodyParser);
server.use(middlewares);

// Register a new user
server.post('/register', (req, res) => {
  const { name, email, password, role } = req.body;
  const users = router.db.get('users');
  
  // Check if the user already exists
  const existingUser = users.find({ email }).value();
  if (existingUser) {
    res.status(400).json({ error: 'User already exists' });
    return;
  }
  
  // Create a new user
  const newUser = { name, email, password, role };
  users.push(newUser).write();
  
  res.json({ message: 'User registered successfully' });
});

// Login
server.post('/login', (req, res) => {
  const { email, password } = req.body;
  const users = router.db.get('users');
  
  // Find the user by email and password
  const user = users.find({ email, password }).value();
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  
  res.json({ message: 'Login successful', user });
});

// Logout
server.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

server.use(router);
server.listen(3000, () => {
  console.log('JSON Server is running on port 3000');
});
