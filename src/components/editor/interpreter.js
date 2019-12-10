import React from 'react';
import { TitleEditor, ParagraphEditor, SectionEditor, PropertyEditor, ListEditor } from '../editor/text';
import MathsEditor from './maths';

class Interpreter {
    /// Interpret the string given into array of strings
    Split(string, limitNewLines = true) {
        let result = string;

        //Reduce newlines
        if (limitNewLines)
            result = string.replace(/(\n){2,}/g, '\n\n');
        
        return result.split('\n');
    }

    /// Interpret the array given into elements with contents
    ToElements(array) {
        let elements = [];

        let section_counter = 0;
        let subsection_counter = 0;
        let subsubsection_counter = 0;

        let listType = 0;

        let isNewParagraph = false;

        array.forEach(element => {
            const tagRegex = new RegExp(/^\\\w*/g);
            const fullTagRegex = new RegExp(/^\\\w{2,}(\{([^{}]+)\})*/g);

            let tagName = '';
            let fullTagName = '';
            let property = '';

            if (tagRegex.test(element))
                tagName = element.match(tagRegex).toString();
            
            if (fullTagRegex.test(element))
                fullTagName = element.match(fullTagRegex).toString();

            const content = element.substring(fullTagName.length).trim();

            if (fullTagName.indexOf('{') !== -1)
                property = fullTagName.substring(
                    fullTagName.indexOf('{') + 1, 
                    fullTagName.indexOf('}')
                );

            // Check if new paragraph
            if (fullTagName === '' && content === '')
            {
                isNewParagraph = true;
                return;
            }

            switch (tagName)
            {
                // Titles
                case '\\title':
                    section_counter = 0;
                    subsection_counter = 0;
                    subsubsection_counter = 0;

                    elements.push(
                        <TitleEditor
                            key={ elements.length }
                            type={ 0 }
                            content={ content }/>
                    );
                    break;
                case '\\subtitle':
                    elements.push(
                        <TitleEditor
                            key={ elements.length }
                            type={ 1 }
                            content={ content }/>
                    );
                    break;

                // Sections
                case '\\section':
                    section_counter++;
                    subsection_counter = 0;
                    subsubsection_counter = 0;

                    elements.push(
                        <SectionEditor
                            key={ elements.length }
                            index={ section_counter }
                            type={ 0 }
                            content={ content }/>
                    );
                    break;
                case '\\unsection':
                    elements.push(
                        <SectionEditor
                            key={ elements.length }
                            index={ 0 }
                            type={ 0 }
                            content={ content }/>
                    );
                    break;
                case '\\newsection':
                    section_counter = 1;
                    subsection_counter = 0;

                    elements.push(
                        <SectionEditor
                            key={ elements.length }
                            index={ section_counter }
                            type={ 0 }
                            content={ content }/>
                    );
                    break;
                case '\\subsection':
                    subsection_counter++;
                    subsubsection_counter = 0;
                    
                    elements.push(
                        <SectionEditor
                            key={ elements.length }
                            index={ subsection_counter }
                            type={ 1 }
                            content={ content }/>
                    );
                    break;
                case '\\unsubsection':
                    elements.push(
                        <SectionEditor
                            key={ elements.length }
                            index={ 0 }
                            type={ 1 }
                            content={ content }/>
                    );
                    break;
                case '\\subsubsection':
                    subsubsection_counter++;
                    
                    elements.push(
                        <SectionEditor
                            key={ elements.length }
                            index={ subsubsection_counter }
                            type={ 2 }
                            content={ content }/>
                    );
                    break;
                case '\\unsubsubsection':
                    elements.push(
                        <SectionEditor
                            key={ elements.length }
                            index={ 0 }
                            type={ 2 }
                            content={ content }/>
                    );
                    break;
                
                // Paragraphs
                case '\\base':
                    elements.push(
                        <ParagraphEditor
                            key={ elements.length }
                            type="base"
                            content={ content }/>
                    );
                    break;
                case '\\italic':
                    elements.push(
                        <ParagraphEditor
                            key={ elements.length }
                            type="italic"
                            content={ content }/>
                    );
                    break;
                case '\\centred':
                    if (isNewParagraph)
                    {
                        elements.push(
                            <ParagraphEditor
                                key={ elements.length }
                                type="center new"
                                content={ content }/>
                        );

                        isNewParagraph = false;
                    }
                    else
                        elements.push(
                            <ParagraphEditor
                                key={ elements.length }
                                type="center"
                                content={ content }/>
                    );
                    break;
                case '\\important':
                    elements.push(
                        <ParagraphEditor
                            key={ elements.length }
                            type="center important"
                            content={ content }/>
                    );
                    break;

                // Properties
                case '\\remark':
                    elements.push(
                        <PropertyEditor
                            key={ elements.length }
                            type={ 0 }
                            property={ property }
                            content={ content }/>
                    );
                    break;
                case '\\definition':
                    elements.push(
                        <PropertyEditor
                            key={ elements.length }
                            type={ 1 }
                            property={ property }
                            content={ content }/>
                    );
                    break;
                case '\\theorem':
                    elements.push(
                        <PropertyEditor
                            key={ elements.length }
                            type={ 2 }
                            property={ property }
                            content={ content }/>
                    );
                    break;

                // Lists
                case '\\list':
                    elements.push(
                        <ListEditor
                            key={ elements.length }
                            type={ listType }
                            content={ content }/>
                    );
                    break;
                case '\\listDash':
                    listType = 0;

                    elements.push(
                        <ListEditor
                            key={ elements.length }
                            type={ listType }
                            content={ content }/>
                    );
                    break;
                case '\\listBullet':
                    listType = 1;

                    elements.push(
                        <ListEditor
                            key={ elements.length }
                            type={ listType }
                            content={ content }/>
                    );
                    break;
                
                // Maths
                case '\\maths':
                    elements.push(
                        <MathsEditor
                            key={ elements.length }
                            content={ content }
                            isImportant={ false }/>
                    );
                    break;
                case '\\mathsImportant':
                    elements.push(
                        <MathsEditor
                            key={ elements.length }
                            content={ content }
                            isImportant={ true }/>
                    );
                    break;
                default:
                    if (isNewParagraph)
                    {
                        elements.push(<ParagraphEditor
                            key={ elements.length }
                            type="paragraph"
                            content={ element } />
                        );

                        isNewParagraph = false;
                    }
                    else
                        elements.push(<ParagraphEditor key={ elements.length } content={ element }/>);

                    break;
            }
        });

        return elements;
    }
}

export default Interpreter