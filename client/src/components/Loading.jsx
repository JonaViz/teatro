import React from 'react';
import { Spin } from 'antd';

const Loading = () => {
  return (
    <div className="p-6 text-center">
      <Spin
        size="large"
        tip="Loading..."
        style={{
          fontSize: '1.5em',
          color: '#6B7280', 
        }}
      />
    </div>
  );
};

export default Loading