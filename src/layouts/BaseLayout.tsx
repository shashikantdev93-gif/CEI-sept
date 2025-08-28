import React from 'react';
import Header1 from '../components/PageComponent/Header1';
import Header2 from '../components/PageComponent/Header2';

type HeaderType = 'Header1' | 'Header2' | 'none';

interface BaseLayoutProps {
  headerType?: HeaderType;
  children: React.ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ headerType = 'Header1', children }) => {
  const headers: Record<Exclude<HeaderType, 'none'>, React.ReactElement> = {
    Header1: <Header1 />,
    Header2: <Header2 />,
  };

  return (
    <>
      {headerType !== 'none' && headers[headerType]}
      <main>{children}</main>
    </>
  );
};

export default BaseLayout;
