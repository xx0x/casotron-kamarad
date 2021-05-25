import PropTypes from 'prop-types';
import { useContext } from 'react';
import IconsContext from '../../utils/IconsContext';

function Icon({
    name, color, size, className
}) {
    const ctx = useContext(IconsContext);
    if (!name) return null;
    return (
        <svg
            draggable={false}
            width={`${size}px`}
            height={`${size}px`}
            viewBox="0 0 512 512"
            className={className}
            aria-label={name}
            title={name}
        >
            <path
                style={{
                    fill: color
                }}
                d={ctx[name]}
            />
        </svg>
    );
}

Icon.propTypes = {
    name: PropTypes.string.isRequired,
    size: PropTypes.number,
    color: PropTypes.string,
    className: PropTypes.string
};

Icon.defaultProps = {
    size: 16,
    className: null,
    color: 'currentColor'
};

export default Icon;