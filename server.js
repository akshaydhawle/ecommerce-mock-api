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

// Custom route to handle retrieving all products with variants
server.get('/products', (req, res) => {
  const products = router.db.get('products').value();
  const variants = router.db.get('variants').value();

  const searchQuery = req.query.q; // Get the search query from the "q" parameter in the query string

  const productsWithVariants = products.map(product => ({
    ...product,
    variants: variants.filter(variant => variant.productId === product.id)
  }));

  // Perform the search based on the product name
  if (searchQuery) {
    const filteredProducts = productsWithVariants.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    res.json(filteredProducts);
  } else {
    res.json(productsWithVariants);
  }
});

server.delete('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const products = router.db.get('products');
  const variants = router.db.get('variants');

  // Remove product
  router.db.get('products')
    .remove({ id: productId })
    .write();

  // Remove associated variants
  router.db.get('variants')
    .remove({ productId: productId })
    .write();

  res.sendStatus(204);
});

server.delete('/variants/:id', (req, res) => {
  const variantId = parseInt(req.params.id);

  // Remove product
  router.db.get('variants')
    .remove({ id: variantId })
    .write();

  res.sendStatus(204);
});

server.use(router);
server.listen(3000, () => {
  console.log('JSON Server is running on port 3000');
});
