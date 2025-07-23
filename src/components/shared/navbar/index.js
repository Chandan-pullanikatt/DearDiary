import React, { useState } from "react"
import Input from '../../atoms/input'
import styles from './navbar.module.scss'
import { Icon } from "@iconify/react"

function Navbar() {
    const [searchText, setSearchText] = useState("");
    return(
        <header className={styles.header}>
        <article className={styles["search-bar"]}>
         {/* searchbar */}
         <Icon icon={"material-symbols:search"} />
        <Input
        type="text" 
        placeholder="  Search Notes"
         value={searchText}
          className={styles["field"]} 
          onChange={(e) => setSearchText(e.target.value)} />
        </article>
        <div className={styles.theme}>
            <Icon icon={"vaadin:sun-down"} />
        </div>
        </header>
    )
}

export default Navbar