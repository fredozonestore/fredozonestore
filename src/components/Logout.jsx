import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
function Logout({ setAuth, setToken, setCountProduct, setUserId }) {
  const naviagte = useNavigate();
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    localStorage.removeItem("username");
    localStorage.removeItem("cart");
    setCountProduct("");
    setAuth(false);
    setUserId("");
    setToken("");
    naviagte("/login");
  }, [naviagte, setAuth, setToken]);
  return <></>;
}

export default Logout;
