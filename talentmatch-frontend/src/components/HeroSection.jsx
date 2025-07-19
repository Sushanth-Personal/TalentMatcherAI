import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Hero = styled.section`
  padding: 50px 20px;
  text-align: center;
  background-color: #fff5e6;
`;

const Title = styled.h2`
  font-size: 48px;
  color: #333;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: #666;
  margin-bottom: 30px;
`;

const CTAButton = styled(Link)`
  display: inline-block;
  background-color: #a8c0b9;
  color: white;
  padding: 15px 30px;
  border-radius: 25px;
  text-decoration: none;
  font-size: 16px;
  &:hover {
    background-color: #87a39a;
  }
`;

function HeroSection() {
  return (
    <Hero>
      <Title>Find the Perfect Creative Talent for Your Brief</Title>
      <Subtitle>Enter your project details and we’ll recommend the top creators.</Subtitle>
      <CTAButton to="/match">Start Matching</CTAButton>
    </Hero>
  );
}

export default HeroSection;