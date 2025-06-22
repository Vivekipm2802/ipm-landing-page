import { useEffect, useState } from 'react';
import styles from './CustomSelect.module.css';

function CustomSelect(props) {
  const [activeState, setActiveState] = useState({
    title: props.defaultText || 'No Default Value',
    value: '',
    ind: props.defaultIndex || -1,
  });
  const [isActive, setIsActive] = useState();

useEffect(()=>{
    
    if(props?.defaultIndex != undefined && typeof props.defaultIndex == "number") {
    setActiveState({ value: props.objects[props.defaultIndex].value, title: props.objects[props.defaultIndex].title, ind: props.defaultIndex });}
},[])

  return (
    <div className={styles.wrapper} style={{ zIndex: props.z, padding: props.noPadding ? '0px' : '' }}>
      <input
        readOnly={props.readonly}
        defaultValue={props.defaultText || ''}
        value={activeState.title}
        className={styles.indicator}
        onClick={() => {
          setIsActive(isActive ? false : true);
        }}
      />
      <span className={isActive ? styles.activeArrow : ''} style={{ top: props.noPadding ? '8px' : '19px' }}>
        <svg  onClick={() => {
          setIsActive(isActive ? false : true);
        }} width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M4.293 8.293a1 1 0 0 1 1.414 0L12 14.586l6.293-6.293a1 1 0 1 1 1.414 1.414l-7 7a1 1 0 0 1-1.414 0l-7-7a1 1 0 0 1 0-1.414Z" fill="#212121" />
        </svg>
      </span>
      <ul className={`${styles.list} ${isActive ? styles.activeList : ''}`}>
        {props.objects &&
          props.objects.map((item, index) => (
            <li
              className={`${styles.lister} ${activeState.ind === index ? styles.activeLister : ''}`}
              key={index}
              onClick={(e) => {
                setActiveState({ value: item.value, title: item.title, ind: index });
                setIsActive(false);
                props.setSelect(props.out ? index : item.value, index);
                props.setId ? props.setId(item.id) : '';
              }}
            >
              {props.mainout ? <h2></h2> : <h2>{item.title}</h2>}
              <p>{item.value}</p>
            </li>
          ))}
      </ul>
    </div>
  );
}

export default CustomSelect;
