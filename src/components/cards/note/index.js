import React, { useState } from "react";
import styles from './note.module.scss';
import { formatDate } from '../../../utils/formatdate'; // Adjust the path as needed

function Note(props) {
    const { text, date, color } = props;
    const [expand, setExpand] = useState(false);

    return (
        <article className={styles.container} style={{ backgroundColor: color }}>
            <div className={styles.content}>
                <p className={expand? styles.expanded : ""}>{text.substring(0, 154)}</p>
                {text.length > 154 ? (
                 <button onClick={() => setExpand((prev) => !prev)}>
                    read {expand ? "less": "more"}
                    </button>
                ) : null}
            </div>
            <footer className={styles.footer}>{formatDate(date)}</footer>
        </article>
    );
}

export default Note;
