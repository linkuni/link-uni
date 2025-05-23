import { Signup } from "./pages/Signup";
import { Login } from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Notes from "./pages/Notes";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import Navbar from "./components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts } from "./redux/posts/postsThunks";
import { useEffect } from "react";
import Dossier from "./pages/Dossier";
import Footer from "./components/Footer";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { EmailVerifying } from "./pages/ActivationPage";
import { BetaBanner } from "./components/BetaBanner";
import { SpeedInsights } from '@vercel/speed-insights/react';
import AIInsights from "./pages/AIInsights";


function App() {
  // Loading posts from the server to the Redux store
  const dispatch = useDispatch();
  const status = useSelector((state) => state.posts.status);
  const error = useSelector((state) => state.posts.error);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchPosts());
    }
  }, [dispatch, status]);

  return (
    <>
      <SpeedInsights />
      <Toaster
        position="bottom-left"
        reverseOrder={false}
       />
      <BrowserRouter>
        <BetaBanner />
        <Navbar />
        <Routes>
          <Route element={<ProtectedRoute />} >
            <Route path="/" element={<Home />} />
            <Route path="/my-profile" element={<Profile />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/dossier" element={<Dossier />} />
            <Route path="/ai-insights/:postId" element={<AIInsights />} />
          </Route>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/password-reset" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
          <Route path="/auth/activation/:token" element={<EmailVerifying />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </>
  );
}

export default App;
