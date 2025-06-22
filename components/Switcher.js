import { useEffect, useState } from 'react';
import styles from './Switcher.module.css'


function Switcher(props){

const [active,setActive] = useState(true);
    const [counter,setCounter] = useState(1);
    const [extra,setExtra] = useState(1);

function Caller(){
    var t = 0;
    const sette = setInterval(()=>{
        setExtra(false);
      
        setCounter(t + 1);
        t += 1;
        
        setTimeout(()=>{

setExtra(true);

        },2500)
        if(t >= props.features.length){
            
            t = 0;
            setCounter(0);
            t = 0;
        }
    },2500);

    
}

useEffect(()=>{

Caller();

},[])

    return(<div className={styles.switcher}>
     
        {/* {counter == 0 ? <p key={counter} className={(active ? styles.active : '') }>{props.features[0]}</p>:''}
        {counter == 1 ? <p key={counter} className={(active ? styles.active : '') }>{props.features[1]}</p>:''}
        {counter == 2 ? <p key={counter} className={(active ? styles.active : '') }>{props.features[2]}</p>:''}
        {counter == 3 ? <p key={counter} className={(active ? styles.active : '') }>{props.features[3]}</p>:''}
        {counter == 4 ? <p key={counter} className={(active ? styles.active : '') }>{props.features[4]}</p>:''} */}
        {props? props.features.map((item,index)=>{
return(<>{counter == index ? <p key={index} className={(active ? styles.active : '') }>{item}</p>:''}</>)

        }):''}
       
        </div>)
}




export default Switcher;