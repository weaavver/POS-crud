import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProductGrid from './components/ProductGrid';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AddProduct from './pages/admin/AddProduct';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderHistory from './pages/OrderHistory';
import NewReleases from './pages/NewReleases';
import About from './pages/About';
import DiscountedGames from './components/DiscountedGames';

function Home() {
  return (
    <>
      <DiscountedGames />
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
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/order-confirmation/:id" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
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
        <Route
          path="/admin/edit-product/:id"
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