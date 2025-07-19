import React from "react";
import { Icon } from "@iconify/react";
import BrandLogo from "../brand";
import sidebarItems from '../../../data/sidebar.json';
import styles from './sidebar.module.scss';
import { useNavigate } from "react-router-dom";
import utils from '../../../utils/localstorage';
import diaryUtils from '../../../utils/diary';
import types from '../../../config/types';

function Sidebar() {
    const navigate = useNavigate();
    
    const handleClick = (item) => {
        if (item.path === '/notes') {
            utils.getFromLocalStorage(types.NOTES_DATA);
            navigate('/notes');
        } else if (item.path === '/diary') {
            navigate('/diary');
        } else {
            navigate(item.path);
        }
    };

    const handleLogout = () => {
        // Clear diary authentication when logging out
        diaryUtils.clearAuthStatus();
        navigate("/");
    };

    return (
        <aside className={styles.sidebar}>
            <BrandLogo logoOnly={true} type={"dark"} className={styles.logo}/>
            <section>
                {sidebarItems.map((item, index) => {
                    return(
                        <article 
                            key={index} 
                            className={styles.item} 
                            onClick={() => handleClick(item)}
                            title={item.title}
                        >
                            <Icon 
                                icon={item.icon} 
                                color={index === 2 ? "var(--light-grey)" : "var(--white)"} 
                            />
                        </article>
                    );
                })}
            </section>
            <article className={styles.logout}>
                <Icon 
                    icon={'material-symbols:logout'} 
                    onClick={handleLogout}
                    title="Logout"
                />
            </article>
        </aside>
    );
}

export default Sidebar;
