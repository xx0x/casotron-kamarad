/* eslint-disable jsx-a11y/label-has-associated-control */

import { Button } from 'react95';

export default function FilePickerButton({
    children, onChange, accept, multiple, buttonProps
}) {
    return (
        <Button
            as="label"
            style={{ position: 'relative', overflow: 'hidden' }}
            {...buttonProps}
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
        </Button>
    );
}