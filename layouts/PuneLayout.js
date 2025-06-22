import styles from './PuneLayout.module.css'

function PuneLayout(props){
    function getCurrentYear() {
        return new Date().getFullYear();
    }
    return <div className={styles.main}>
    
<div className={styles.navigation}></div>
<div className={styles.container}>{props.children}</div>

<div className={styles.footer}>
<div className={styles.logoholder}>
    <img src='/ipm_logo.svg'/>
</div>


</div>
<div className={styles.credits}>
    <div>
Copyright © {getCurrentYear()} IPM Careers. All rights reserved.</div>

</div>
</div>
}

export default PuneLayout;