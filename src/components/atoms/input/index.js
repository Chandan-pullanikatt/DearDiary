import React from "react";
import styles from './input.module.scss';

function Input(props) {
    const { type, value, onChange, title, placeholder, className, isDisabled } = props;

    return (
        <article className={`${styles.box} ${className}`}>
            {title && <h4>{title}</h4>}
            <input
                type={type || 'text'}
                placeholder={placeholder || title}
                value={value}
                onChange={onChange}
                disabled={isDisabled}
            />
        </article>
    );
}

export default Input;
