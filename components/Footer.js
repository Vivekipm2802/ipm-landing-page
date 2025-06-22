import styles from './Footer.module.css'

function Footer(props){

    return(<div className={styles.footer}>
    <div className={styles.top}>
<h2>India's Premium {props?.diff == true ? 'NPAT' : 'IPMAT'} Coaching <br/>for True {props?.diff == true ? 'NPAT' : 'IPMAT'} Aspirants</h2>
<a href="#form">Get Started Now</a>
    </div>
    
    </div>)
}
export default Footer;