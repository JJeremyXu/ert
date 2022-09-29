import { useState } from "react";

//sample code for testing
type messageProps = {
  message: string;
}
const App = (props:messageProps) => {

  const [msg,setMsg] = useState('message');
  return(
      <>
      <p>hello from react</p>
      <h1 id='msg'>{msg}</h1>
      <button onClick={()=>{
        setMsg(props.message);
      }}>click</button>
      </>
    );
};
export default App;


