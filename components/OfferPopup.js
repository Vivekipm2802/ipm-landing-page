
import { useCallback, useEffect, useRef } from "react";
import ReactCanvasConfetti from "react-canvas-confetti";
import styles from './OfferPopup.module.css'

function Offer(props){

  
    useEffect(()=>{

        if(props?.submitted == true){
            fire()
        }
    },[props?.submitted])


    const canvasStyles = {
        position: "fixed",
        pointerEvents: "none",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        zIndex:9999,
      };

    const refAnimationInstance = useRef(null);

    const getInstance = useCallback((instance) => {
      refAnimationInstance.current = instance;
    }, []);
  
    const makeShot = useCallback((particleRatio, opts) => {
      refAnimationInstance.current &&
        refAnimationInstance.current({
          ...opts,
          origin: { y: 0.7 },
          particleCount: Math.floor(200 * particleRatio)
        });
    }, []);
  
    const fire = useCallback(() => {
      makeShot(0.25, {
        spread: 26,
        startVelocity: 55
      });
  
      makeShot(0.2, {
        spread: 60
      });
  
      makeShot(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
      });
  
      makeShot(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
      });
  
      makeShot(0.1, {
        spread: 120,
        startVelocity: 45
      });
    }, [makeShot]);


    function getCoupon(a) {
      if(a == undefined && props?.submitted == false){
        return 'ERROR GENERATING COUPON'
      }
      // Extract first 3 letters from fullname, email, and phone
      const namePrefix = a.fullname.substring(0, 3).toUpperCase();
      const emailPrefix = a.email.substring(0, 3).toUpperCase();
      const phonePrefix = a.phone.substring(0, 3).toUpperCase();
    
      // Combine the prefixes to generate the coupon code
      const couponCode = namePrefix + emailPrefix + phonePrefix;
    
      return couponCode;
    }

    return <>
{props?.submitted == true ? 
    <div className={styles.full}>

      <div className={styles.inner}>
<div className={styles.top}>
  <img src="/cele.svg"/>
  <div className={styles.close} onClick={()=>{props?.onClose(false)}}><svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11.883 3.007 12 3a1 1 0 0 1 .993.883L13 4v7h7a1 1 0 0 1 .993.883L21 12a1 1 0 0 1-.883.993L20 13h-7v7a1 1 0 0 1-.883.993L12 21a1 1 0 0 1-.993-.883L11 20v-7H4a1 1 0 0 1-.993-.883L3 12a1 1 0 0 1 .883-.993L4 11h7V4a1 1 0 0 1 .883-.993L12 3l-.117.007Z" fill="#000"/></svg></div>
</div>
<div className={styles.bottom}>
  <h3 style={{color:'green', display:'flex',alignItems:'center' ,justifyContent:'center'}}> <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2Zm3.22 6.97-4.47 4.47-1.97-1.97a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.06 0l5-5a.75.75 0 1 0-1.06-1.06Z" fill="green"/></svg> Form Submitted Successfully</h3>
  <h4>Our Executive will reach out to you shortly.</h4>
  <div className={styles.divider}></div>
<p>Visit our website to explore our courses</p>
  <h2 className={styles.pune}>Thank you for Choosing<br/> IPM Careers Pune</h2>
  {/* <p>Your Coupon Code is</p> */}
  {/* <h3 className={styles.coupon}>{getCoupon(props?.data)}</h3> */}

</div>
      </div>
    </div>:''}
    <ReactCanvasConfetti refConfetti={getInstance} style={canvasStyles} />
    </>
}

export default Offer;