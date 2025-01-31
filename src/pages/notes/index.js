import React, { useEffect, useState } from "react";
import styles from './notes.module.scss';
import Wrapper from "../../components/hoc/wrapper";
import Greeting from "../../components/atoms/greeting";
import Note from "../../components/cards/note";
import notesData from '../../data/notes.json'
//import { getFromLocalStorage } from "../../utils/localstorage";
import utils from '../../utils/localstorage'
import types from '../../config/types'

function Notes() {
    const [notesColl, setNotesColl] = useState([]);

    useEffect(()  => {
        const data = utils.getFromLocalStorage(types.NOTES_DATA);
        if(data && data.length) {
            setNotesColl(notesData);
            return;
        }
        utils.addtoLocalStorage(types.NOTES_DATA , notesData);
        setNotesColl(notesData);
    }, []);

    return (
        <section className={styles.container}>
            <Greeting />
            <main>
               {notesColl.map((note, i) =>  (
                <Note key={note.id} text={note.text} date={note.createdAt} color={note.color}/>))}
            </main>
        </section>
    );
}

export default Wrapper(Notes);
