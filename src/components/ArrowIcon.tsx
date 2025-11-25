import React from 'react';

interface ArrowIconProps {
    className?: string;
    size?: number;
}

const ArrowIcon: React.FC<ArrowIconProps> = ({ className = '', size = 20 }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M8 4L16 12L8 20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>

    );
};

export default ArrowIcon;
