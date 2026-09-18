
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
    return (
        <nav className="navbar">

            <Link to="/" className="navbar-logo">
                🌱 AgriAI
            </Link>

            <div className="navbar-links">

                <Link to="/">
                    Dashboard
                </Link>

                <Link to="/disease-detection">
                    Disease Detection
                </Link>

                <Link to="/crop-recommendation">
                    Crop Recommendation
                </Link>

                <Link to="/yield-prediction">
                    Yield Prediction
                </Link>

                <Link to="/disease-risk">
                    Disease Risk
                </Link>

                <Link to="/crop-life-cycle">
                    Crop Life Cycle
                </Link>

                <Link to="/research">
                    Research AI
                </Link>

            </div>

        </nav>
    );
}

export default Navbar;

