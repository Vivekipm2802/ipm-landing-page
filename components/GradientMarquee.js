import styles from './GradientMarquee.module.css';
import Marquee from "react-fast-marquee";
function GradientMarquee(props){

    return <div className={styles.holder + " " + (props?.straight == true ? styles.straight : '')}>
    <Marquee speed={80} gradient={false}><h2 className={styles.maintext}>{props.text}  {props.text}  {props.text}  {props.text} </h2></Marquee></div>
}


export default GradientMarquee;