import { useState } from 'react';
import styles from './AccModule.module.css'

function AccModule(props){

const [activeModule,setActiveModule] = useState();

return <div className={styles.modules}>
{props.data && props?.data?.map((i,d)=>{

return <div onClick={()=>{setActiveModule(activeModule != d ? d : undefined)}} className={styles.module + " " + (activeModule == d ? styles.activeModule : '')}>
<div className={styles.moduleinner}>
    <div className={styles.modwrap}>
    <h2>{i.question}</h2>

    </div>
<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11.883 3.007 12 3a1 1 0 0 1 .993.883L13 4v7h7a1 1 0 0 1 .993.883L21 12a1 1 0 0 1-.883.993L20 13h-7v7a1 1 0 0 1-.883.993L12 21a1 1 0 0 1-.993-.883L11 20v-7H4a1 1 0 0 1-.993-.883L3 12a1 1 0 0 1 .883-.993L4 11h7V4a1 1 0 0 1 .883-.993L12 3l-.117.007Z" fill="#212121"/></svg>
</div>

<div className={styles.modulecontent}>
      
<div dangerouslySetInnerHTML={{__html:i.answer}}></div>
</div>
</div>})}</div>

}
export default AccModule;