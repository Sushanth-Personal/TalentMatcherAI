import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 50px;
  background-color: #fff5e6;
`;

const Logo = styled.h1`
  font-size: 24px;
  color: #333;
`;

const NavLinks = styled.div`
  a {
    margin-left: 20px;
    text-decoration: none;
    color: #333;
    font-size: 16px;
  }
  a:hover {
    color: #007bff;
  }
`;

const LoginButton = styled.button`
  background-color: #d3e0dc;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
`;

function Header() {
  return (
    <Nav>
      <Logo>BreadButter</Logo>
      <NavLinks>
        <Link to="/">Home</Link>
        <Link to="/match">Match Talent</Link>
        <Link to="/creators">Creators</Link>
        <Link to="/about">About</Link>
        <LoginButton>Log in</LoginButton>
      </NavLinks>
    </Nav>
  );
}

export default Header;