// @ts-ignore
import React, {useContext, useEffect, useState} from 'react';
import { Editor } from '@tinymce/tinymce-react';
import {ThemeContext} from "../../App";

export interface ITinyEditorProps {
    data?: string;
    saveData?: any;
    id?: string;
    change?: (value: string, data?: any) => void;
    text?: string;
    disabled?: boolean;
}

const TinyEditor = (props: ITinyEditorProps) => {

    return (
        <div id={props.id} className={'tinyEditor'} style={{width: '100%', margin: '0', borderRadius: '10px'}}>
            <Editor
                disabled={props.disabled && props.disabled}
                apiKey={'3uetdnfxyie6hcovs461qfnxn0jhknjqq0r3yla8brosmpk5'}
                value={props.data && props.data}
                init={{
                    height: 100,
                    skin: 'material-classic',
                    statusbar: false,
                    menubar: false,
                    icons: 'thin',
                    plugins: [
                        'charmap print preview anchor help',
                        'searchreplace visualblocks code',
                        'insertdatetime media table paste wordcount',
                        'emoticons'
                    ],
                    toolbar:
                        'emoticons',
                    toolbar_location: 'bottom',
                    content_style: `body { font-family:Helvetica, Arial, sans-serif; font-size: 14px; color: rgba(0, 0, 0, 0.6);}`
                }}
                onEditorChange={props.change}
            />
        </div>
    );
}

export default TinyEditor;