import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProductGrid from './components/ProductGrid';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AddProduct from './pages/admin/AddProduct';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderHistory from './pages/OrderHistory';
import NewReleases from './pages/NewReleases';
import About from './pages/About';

function Home() {
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 pt-10">
        <h1 className="text-3xl font-bold text-white">Welcome to Vault</h1>
        <p className="mt-2 text-[#8f98a0]">Your digital library starts here.</p>
      </div>
      <ProductGrid />
    </>
  );
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/new-releases" element={<NewReleases />} />
        <Route path="/about" element={<About />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/add-product"
          element={
            <AdminRoute>
              <AddProduct />
            </AdminRoute>
          }
        />
      </Routes>
    </Layout>
  );
}

export default App;