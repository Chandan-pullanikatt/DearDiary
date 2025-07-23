import React from 'react';
import BrandLogo from '../shared/brand';
import styles from './header.module.scss'
import moon from '../../assets/moon.png'

function Header({ handleToggle }) {
    return (
        <nav className={styles.container}>
            <div className={styles.logo}>
                <BrandLogo />
                <h2>DearDiary</h2>
            </div>
            <div className={styles['nav_items']}>
                <div className={styles.toggle} onClick={handleToggle}>
                    <img src={moon} alt="moon" />
                </div>
            </div>
        </nav>
    );
}

export default Header; 