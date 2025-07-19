import styled from 'styled-components';

const FooterContainer = styled.footer`
  background-color: #d3e0dc;
  padding: 20px;
  text-align: center;
  color: #333;
  margin-top: 20px;
`;

function Footer() {
  return (
    <FooterContainer>
      <p>Contact: info@breadbutter.com | © 2025 BreadButter</p>
    </FooterContainer>
  );
}

export default Footer;