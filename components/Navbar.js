import styles from './Navbar.module.css';

function Navbar(props){
    return(<div className={styles.navbar + " " + (props.scrolled? styles.scrolled:'')}>
        <a className={styles.header} href="#"><img alt='IPM Careers Logo' src='/ipm_logo.svg'/></a>
        <div>
            <a className={styles.register} href='#form'>Register Now</a>
        </div>
        </div>)
}

export default Navbar;