import { useState } from 'react';
import styles from './ImageTab.module.css';


function ImageTab(props) {
    const [activeAnimation,setactiveAnimation] = useState(props.items[0].animation);
    const [image,setisImage] = useState(props.items[0].animation? false:true);
    const [active,setActive] = useState(0);

    const [location,setLocation] = useState(props.items[0].location ? props.items[0].location : '');
    const [activeImage,setactiveImage] = useState(props.items[0].image);
    const defaultOptions = {
        loop: true,
        autoplay: true, 
        height:100,
        animationData: activeAnimation,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid meet'
        }
      };
     
    return(<div className={styles.maincont + " " + (props.special?styles.special:'')}>

<div className={styles.col1}>
<div className={styles.list}>
{props && props.items.map((i,d)=>{
return(
    <div key={d} onClick={()=>{setActive(d),setactiveImage(i.image),setactiveAnimation(i.animation ? i.animation :''),setisImage(i.animation ? false : true),setLocation(i.location)}} className={styles.block + " " + (active == d? styles.activeblock:'')}>
        <h2>{i.title}</h2>
       {props.special ? <div className={styles.listad}><ul>{i.items ?i.items.split("%").map((i,d)=>{ return <li>{i}</li>}) : ''}</ul></div> : <p>{i.subtitle}</p>}
    </div>
)
})}</div>

</div>
<div className={styles.col2}>
    {image?<img src={activeImage} className={props.location?styles.loc:''} width="auto" height="auto"/>:''}
    {image && props.location?<div className={styles.iframe} dangerouslySetInnerHTML={{__html:location}}></div>:''}
   {/*  {image == false ?<>
       

    </>: ''} */}
</div>

    </div>)
}

export default ImageTab;