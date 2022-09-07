import React from 'react';
import Helmet from "react-helmet";

//IT CHANGES THE HEADING IN THE TITLE WHERE REACT APP IS WRITTEN
const MetaData = ({title}) => {
  return (
    <Helmet>
        <title>
            {title}
        </title>
    </Helmet>
  );
};

export default MetaData