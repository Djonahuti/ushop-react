import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "@/routes/Login"
import Register from "@/routes/Register"
import NotFound from "@/routes/NotFound"
import { useAuth } from "@/context/AuthContext"
import AuthLayout from "./_auth/AuthLayout"
import RootLayout from "./_root/RootLayout"
import Home from "./_root/pages/Home"
import { ProtectedRoute } from "./components/ProtectedRoute"
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
import Inbox from "./components/shared/Mail/Inbox"
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


function App() {
  const { user } = useAuth()

  return (
    <>
    <main>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <>
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={user ? "/" : "/login"} />} />
        <Route
          path="/aba"
          element={
            <ProtectedRoute>
              <AddImages />
            </ProtectedRoute>
          }
        />
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
          <Route
            path="/edit/:productId"
            element={
              <EditProduct />
            }
          />
        </Route>

        {/* Admin routes */}
        <Route element={<SellerLayout />}>
          <Route path="/seller-dashboard" element={<SellerRoute><SellerDashboard /></SellerRoute>} />
          <Route path="/sell-product" element={<SellerRoute><SellProduct /></SellerRoute>} />
          <Route path="/dashboard2" element={<SellerRoute><MainContent /></SellerRoute>} />
          <Route path="/personalize" element={<SellerRoute><Personalize /></SellerRoute>} />
          <Route path="/database" element={<SellerRoute><Database /></SellerRoute>} />
          <Route path="/users" element={<SellerRoute><Database /></SellerRoute>} />
          <Route path="/my-products" element={<SellerRoute><MyProducts /></SellerRoute>} />
          <Route path="/orders-me" element={<SellerRoute><SellerPendingOrders /></SellerRoute>} />
          <Route path="/feeds" element={<SellerRoute><AllFeedbacks /></SellerRoute>} />
          <Route
            path="/update/:productId"
            element={
              <EditProduct />
            }
          />
        </Route>        

        <Route element={<MailLayout />}>
          <Route path="/inbox" element={<AdminRoute><Inbox /></AdminRoute>} />
        </Route>
        
        {/* public routes */}
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="/products/:productId" element={<ProductDetails />} />
          <Route path="/search" element={<SearchResults />} />
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
          path="/feedback/:orderId"
          element={
            <StrictRoute>
              <FeedbackPage />
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
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
        </Route>
      </Routes>
    </Router>
        </>
      </ThemeProvider>
    </main>
    </>
  )
}

export default App
