import React from "react";
import { Link, withRouter } from "react-router-dom";
import styles from './App.module.css';
// import icon from './Assets/icon.png';

function Navigation(props) {
  return (
    <div className="navigation">
      <nav class="py-2 navbar navbar-expand-sm">
        <div class="container">
        {/* <img src={icon} style={{height: 40, width: 40}} alt="Logo" />  */}
          <div class="collapse navbar-collapse" id="navbarResponsive">
            <ul class="navbar-nav ml-auto">
              <li
                class={`nav-item  ${
                  props.location.pathname === "/" ? "active" : ""
                }`}
              >
                <Link class="nav-link" to="/" className={styles.navbarlinks}>
                  Dashboard
                  <span class="sr-only">(current)</span>
                </Link>
              </li>
              <li
                class={`nav-item  ${
                  props.location.pathname === "/verify" ? "active" : ""
                }`}
              >
                <Link class="nav-link" to="/rating" className={styles.navbarlinks}>
                  Credit Rating
                </Link>
              </li>
              <li
                class={`nav-item  ${
                  props.location.pathname === "/verify" ? "active" : ""
                }`}
              >
                <Link class="nav-link" to="/about" className={styles.navbarlinks}>
                  About
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
      </nav>
    </div>
  );
}

export default withRouter(Navigation);