import React from 'react'

interface IHeadingProps {
    title: string;
    description: string;
    keywords: string;
}

const Heading: React.FC<IHeadingProps> = ({ title, description, keywords }) => {
    return (
        <>
            <title>{title}</title>
            <meta name="viewport" content='width=device-width, initial-scale=1' />
            <meta name='description' content={description} />
            <meta name='keywords' content={keywords} />
        </>
    )
}

export default Heading