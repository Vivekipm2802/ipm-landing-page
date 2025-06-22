import { useState } from 'react';
import styles from './FAQ.module.css'

function FAQ(props){

    const [activeIndex,setactiveIndex] = useState();

    return(<div className={styles.holder}>
{props.items && props.items.map((i,d)=>{
return<div className={styles.faqblock + " " +(activeIndex != undefined && activeIndex == d ? styles.active :'') + " " + (activeIndex != undefined && activeIndex != d ? styles.inactive :'')}>
<div onClick={()=>{activeIndex != d ? setactiveIndex(d) :setactiveIndex() }} className={styles.heading}>{i.question} <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048"><path d="M2048 960v128h-960v960H960v-960H0V960h960V0h128v960h960z" fill="#333333"/></svg></div>
<div className={styles.content} dangerouslySetInnerHTML={{__html:i.answer}}>
{/* {
    i.answer.split("\n").map(function(item, idx) {
        return (
            <span key={idx}>
                {item}
                <br/>
            </span>
         )
    })
} */}

</div>
    
</div>
})}



    </div>)
}


export default FAQ;