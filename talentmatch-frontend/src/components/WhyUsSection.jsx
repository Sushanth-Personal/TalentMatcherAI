import styled from 'styled-components';

const WhyUs = styled.section`
  padding: 50px 20px;
  text-align: center;
  background-color: #fff5e6;
`;

const CardContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
`;

const Card = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  width: 200px;
`;

const Icon = styled.div`
  width: 50px;
  height: 50px;
  background-color: #d3e0dc;
  border-radius: 50%;
  margin: 0 auto 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CardTitle = styled.h3`
  font-size: 18px;
  color: #333;
`;

function WhyUsSection() {
  return (
    <WhyUs>
      <h2>Why Us</h2>
      <CardContainer>
        <Card>
          <Icon>🚀</Icon>
          <CardTitle>Fast & Accurate Matches</CardTitle>
        </Card>
        <Card>
          <Icon>👥</Icon>
          <CardTitle>10,000+ Verified Creators</CardTitle>
        </Card>
        <Card>
          <Icon>🤖</Icon>
          <CardTitle>AI-enhanced Recommendations</CardTitle>
        </Card>
      </CardContainer>
    </WhyUs>
  );
}

export default WhyUsSection;