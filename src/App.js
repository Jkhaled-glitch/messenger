// import app css file
import "./App.css";
// importing header component
import Header from "./components/header/header";
// import login component
import Login from "./pages/login/login";
// import router element
import {
  BrowserRouter as Router,
  Routes,
  Route,
  HashRouter,
} from "react-router-dom";
// import not found page
import NotFound from "./pages/not-found/notFound";
// import home component
import Home from "./pages/home/home";
// import mobile navbar
import Nav from "./components/navbar-mobile/nav";
import { useEffect, useState } from "react";
// import notifications component
import Notifications from "./pages/notifications/notifications";
// import Messages component
import Messages from "./pages/messages/messages";
// import User component
import User from "./pages/user/user";
// import post details component
import Details from "./pages/post-details/details";
import ResetPassword from "./pages/resetPaswword/resetPassword";
import axios from 'axios'

function App() {
  // set user login status
  const [authentificated, setAuthentificated] = useState(false);

  // Loader content charging state
  const [isLoading, setIsLoading] = useState(true);

  const tokenIsValid = async (token) => {
    try {
      await axios.get(`${process.env.REACT_APP_SERVER_BASE_URI}/users/isUser`, {
        headers: { 'Authorization': token }
      });
      return true; // Si la requête réussit, le token est valide
    } catch (err) {
      console.error(err);
      localStorage.removeItem("user-login"); // Supprimer le token invalide
      return false; // Si une erreur se produit, le token est invalide
    }
  };
  
  // Utiliser un effet pour vérifier l'authentification lorsque le composant est monté
  useEffect(() => {
    const checkAuthentication = async () => {
      const token = localStorage.getItem("user-login");
  
      if (token) {
        if (await tokenIsValid(token)) {

          // Si le token est valide, authentifier l'utilisateur
          setAuthentificated(true);
        } else {
          // Si le token est invalide, déconnecter l'utilisateur et le rediriger vers la page de connexion
          setAuthentificated(false);
        }
      } else {
        // Si aucun token n'est enregistré, déconnecter l'utilisateur
        setAuthentificated(false);
      }
  
      // Arrêter le chargement une fois que l'authentification est vérifiée
      setIsLoading(false);
    };
  
    // Appeler la fonction de vérification de l'authentification
    checkAuthentication();
  }, []);
  

  return !isLoading ? (
    <HashRouter>
      {authentificated && <Header />}

      <div className="App">
        <Routes>
          <Route
            exact
            path="/"
            element={authentificated ? <Home /> : <Login />}
          />
          <Route
            path="/notifications"
            element={authentificated ? <Notifications /> : <Login />}
          />
          <Route
            path="/messages"
            element={authentificated ? <Messages /> : <Login />}
          />
          <Route
            path="/profile"
            element={authentificated ? <User /> : <Login />}
          />
          <Route
            path="/login/reset-password"
            element={authentificated ? <User /> : <ResetPassword />}
          />
          <Route path="/posts/details/:postId" 
          element= {authentificated ? <Details /> : <Login />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      {authentificated && <Nav />}
    </HashRouter>
  ) : (
    <div class="app-loader">
      <div class="dot-spinner">
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
      </div>
    </div>
  );
}

export default App;
