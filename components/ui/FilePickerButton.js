/* eslint-disable jsx-a11y/label-has-associated-control */

export default function FilePickerButton({
    className, children, onChange, accept, multiple
}) {
    return (
        <label
            className={className || 'button'}
            style={{ position: 'relative', overflow: 'hidden' }}
        >
            <input
                type="file"
                style={{ position: 'absolute', right: '100%' }}
                accept={accept}
                multiple={multiple}
                onChange={(e) => {
                    if (e && e.target.files) {
                        if (!multiple) {
                            if (e.target.files.length > 0 && e.target.files[0]) {
                                onChange(e.target.files[0]);
                            } else {
                                onChange(null);
                            }
                        } else {
                            onChange(e.target.files);
                        }
                        return;
                    }
                    e.target.value = null;
                }}
            />
            {children}
        </label>
    );
}