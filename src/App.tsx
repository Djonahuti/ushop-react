import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom"
import Login from "@/routes/Login"
import Register from "@/routes/Register"
import NotFound from "@/routes/NotFound"
import { useAuth } from "@/context/AuthContext"
import AuthLayout from "./_auth/AuthLayout"
import RootLayout from "./_root/RootLayout"
import Home from "./_root/pages/Home"
//import { ProtectedRoute } from "./components/ProtectedRoute"
import { AdminLogin } from "./_auth/forms/AdminLogin"
import AdminLayout from "./admin/AdminLayout"
import AdminRoute from "./admin/AdminRoute"
import PostForm from "./components/shared/Forms/PostForm"
import DashboardContent from "./admin/pages/DashboardContent"
import Profile from "./admin/pages/Profile"
import AdminDashboard from "./admin/pages/AdminDashboard"
import { ThemeProvider } from "./components/theme-provider"
import PostCategoryForm from "./components/shared/Forms/PostCategory"
import ProductDetails from "./routes/ProductDetails"
import StrictRoute from "./components/StrictRoute"
import Cart from "./_root/pages/Cart"
import Wishlist from "./_root/pages/Wishlist"
import CustomerProfile from "./routes/CustomerProfile"
import AddForm from "./components/shared/Forms/AddForm"
import AddImages from "./components/shared/Forms/AddImages"
import ProductList from "./components/shared/ViewProducts"
import EditProduct from "./components/shared/EditProduct"
import { Database } from "./admin/pages/Database"
import Checkout from "./_root/pages/Checkout"
import AdminPendingOrders from "./admin/pages/AdminPendingOrders"
import AddBank from "./components/shared/Forms/AddBank"
import ViewPayment from "./admin/pages/ViewPayment"
import CustomerOrders from "./_root/pages/CustomerOrder"
import ConfirmPay from "./_root/pages/ConfirmPay"
import CustomerLayout from "./_root/CustomerLayout"
import MailLayout from "./components/shared/Mail/MailLayout"
import Overview from "./components/shared/Overview"
import FeedbackPage from "./_root/pages/FeedbackPage"
import Contact from "./_root/pages/Contact"
import SeeFeedbacks from "./_root/pages/SeeFeedbacks"
import AllFeedbacks from "./admin/pages/AllFeedbacks"
import SearchResults from "./routes/SearchResults"
import OrderStatus from "./_root/pages/OrderStatus"
import SellerLayout from "./seller/SellerLayout"
import SellerRoute from "./seller/SellerRoute"
import SellerDashboard from "./seller/pages/SellerDashboard"
import MainContent from "./seller/pages/DashboardContent"
import Personalize from "./seller/pages/Personalize"
import SellerPendingOrders from "./seller/pages/SellerPendingOrders"
import MyProducts from "./seller/pages/MyProducts"
import SellProduct from "./seller/forms/SellProduct"
import AddBundle from "./components/shared/Forms/AddBundle"
import Bundle from "./_root/pages/Bundles"
import Choices from "./_root/pages/Choices"
import MailView from "./components/shared/Mail/MailView"
import Coupons from "./_root/pages/Coupon"
import { useEffect } from "react"
import supabase from "./lib/supabaseClient"


function App() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const checkUserRole = async () => {
      if (user) {
        const { data: admin, error: adminError } = await supabase
          .from('admins')
          .select('*')
          .eq('admin_email', user.email)
          .single();

        if (admin && !adminError) {
          navigate('/admin-dashboard');
          return;
        }

        const { data: seller, error: sellerError } = await supabase
          .from('sellers')
          .select('*')
          .eq('seller_email', user.email)
          .single();

        if (seller && !sellerError) {
          navigate('/seller-dashboard');
          return;
        }

        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('customer_email', user.email)
          .single();

        if (customer && !customerError) {
          navigate('/overview');
          return;
        }
      }
    };

    checkUserRole();
  }, [user, navigate]);

  return (
    <>
    <main>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
        
        {/* Admin routes */}
        <Route element={<AdminLayout />}>
          <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/add-cat" element={<AdminRoute><PostCategoryForm /></AdminRoute>} />
          <Route path="/add-product" element={<AdminRoute><PostForm /></AdminRoute>} />
          <Route path="/add-bank" element={<AdminRoute><AddBank /></AdminRoute>} />
          <Route path="/view-payments" element={<AdminRoute><ViewPayment /></AdminRoute>} />
          <Route path="/add-form" element={<AdminRoute><AddForm /></AdminRoute>} />
          <Route path="/dashboard" element={<AdminRoute><DashboardContent /></AdminRoute>} />
          <Route path="/account" element={<AdminRoute><Profile /></AdminRoute>} />
          <Route path="/database" element={<AdminRoute><Database /></AdminRoute>} />
          <Route path="/users" element={<AdminRoute><Database /></AdminRoute>} />
          <Route path="/view-products" element={<AdminRoute><ProductList /></AdminRoute>} />
          <Route path="/view-orders" element={<AdminRoute><AdminPendingOrders /></AdminRoute>} />
          <Route path="/feeds" element={<AdminRoute><AllFeedbacks /></AdminRoute>} />
          <Route path="/add-bundle" element={<AdminRoute><AddBundle /></AdminRoute>} />
          <Route
          path="/order-history"
          element={
            <AdminRoute><OrderStatus /></AdminRoute>
          }
          />
          <Route
            path="/edit/:productId"
            element={
              <EditProduct />
            }
          />
        </Route>

        {/* Seller routes */}
        <Route element={<SellerLayout />}>
          <Route path="/seller-dashboard" element={<SellerRoute><SellerDashboard /></SellerRoute>} />
          <Route path="/sell-product" element={<SellerRoute><SellProduct /></SellerRoute>} />
          <Route path="/dashboard2" element={<SellerRoute><MainContent /></SellerRoute>} />
          <Route path="/personalize" element={<SellerRoute><Personalize /></SellerRoute>} />
          <Route path="/database" element={<SellerRoute><Database /></SellerRoute>} />
          <Route path="/users" element={<SellerRoute><Database /></SellerRoute>} />
          <Route path="/my-products" element={<SellerRoute><MyProducts /></SellerRoute>} />
          <Route path="/orders-me" element={<SellerRoute><SellerPendingOrders /></SellerRoute>} />
          <Route path="/sell-feeds" element={<SellerRoute><AllFeedbacks /></SellerRoute>} />
          <Route
            path="/update/:productId"
            element={
              <EditProduct />
            }
          />
        </Route>        

        <Route element={<MailLayout />}>
          <Route path="/my-inbox" element={<AdminRoute><MailView /></AdminRoute>} />
        </Route>
        
        {/* public routes */}
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="/products/:productId" element={<ProductDetails />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/bundle" element={<Bundle />} />
          <Route path="/choice" element={<Choices />} /> 
          <Route path="/aba" element={<AddImages />} />          
        <Route
          path="/cart"
          element={
            <StrictRoute>
              <Cart />
            </StrictRoute>
          }
        />

        <Route
          path="/wishlist"
          element={
            <StrictRoute>
              <Wishlist />
            </StrictRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <StrictRoute>
              <Checkout />
            </StrictRoute>
          }
        />

        </Route>

        {/* Customer routes */}
        <Route element={<CustomerLayout />}>

        <Route
          path="/feedbacks"
          element={
            <StrictRoute>
              <SeeFeedbacks />
            </StrictRoute>
          }
        />

        <Route
          path="/overview"
          element={
            <StrictRoute>
              <Overview />
            </StrictRoute>
          }
        />

        <Route
          path="/my-cart"
          element={
            <StrictRoute>
              <Cart />
            </StrictRoute>
          }
        />

        <Route
          path="/my-orders"
          element={
            <StrictRoute>
              <CustomerOrders />
            </StrictRoute>
          }
        />
        <Route
          path="/order"
          element={
            <StrictRoute><OrderStatus /></StrictRoute>
          }
        />

        <Route
          path="/confirm-pay/:invoiceNo"
          element={
            <StrictRoute>
              <ConfirmPay />
            </StrictRoute>
          }
        />

        <Route
          path="/feedback"
          element={
            <StrictRoute>
              <FeedbackPage />
            </StrictRoute>
          }
        />

        <Route
          path="/coupon"
          element={
            <StrictRoute>
              <Coupons />
            </StrictRoute>
          }
        />

        <Route
          path="/contact"
          element={
            <StrictRoute>
              <Contact />
            </StrictRoute>
          }
        />

        <Route
          path="/wishlists"
          element={
            <StrictRoute>
              <Wishlist />
            </StrictRoute>
          }
        />        

        <Route
          path="/profile"
          element={
            <StrictRoute>
              <CustomerProfile />
            </StrictRoute>
          }
        />
        </Route>        

        {/* private routes */}
        <Route element={<AuthLayout />}>
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/" /> : <Register />} />
        </Route>
      </Routes>
        </>
      </ThemeProvider>
    </main>
    </>
  )
}

const Root = () => (
  <Router>
    <App />
  </Router>
);

export default Root
