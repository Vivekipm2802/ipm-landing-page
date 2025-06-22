import React, { useState, useRef, useMemo, useEffect } from 'react';
import JoditEditor from 'jodit-react';
import styles from './CustomEditor.module.css'

function CustomEditor(props){
  
    const editor = useRef(null);
	const [content, setContent] = useState(props.data? props.data : '');
    const config = useMemo(() => ({
        readonly: false,
        placeholder: props.data || 'Start typings...',
      }), [props.data]);
	
	
    return <div className={styles.edit}>
    
    <JoditEditor
			ref={editor}
			value={content}
			
			tabIndex={1} // tabIndex of textarea
			/* onBlur={newContent => setContent(newContent)}  */// preferred to use only this option to update the content for performance reasons
			onChange={newContent => {setContent(newContent),props.onChange(newContent)}}
		/>
    
  </div>
}

export default CustomEditor;