import React from 'react';
import {Link} from 'react-router-dom';
import logo from '../images/logo_nlg.png';
import {Row} from 'reactstrap';

function Navbar() {
  return (
    <nav className="navbar navbar-dark fixed-top my-nav">
        <Row>
            <Link to="#"> <div className="logonavb">
                <img src={logo} alt="Orange NLG" height='100em'/>
                </div>
            </Link>
        </Row>
         
    </nav>
  );
}

export default Navbar;