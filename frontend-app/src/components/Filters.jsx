import * as React from "react";

export default function Filters({ className, children, onApply, onReset }) {
    const handleSubmit = (e) => {
        e.preventDefault();
        onApply?.();
    };

    return (
        <div className={className}>
            <div className="rounded-md border">
                <h2 className='bg-[#1a1a1ad3] text-[#fff] p-[0.65rem] rounded-t text-center'>Filters</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-2">
                    {children}

                    <input type="submit" style={{ display: 'none' }} />
                </form>
            </div>

            <div className="flex gap-2">
                <button
                    className="button-primary my-2 w-full"
                    onClick={onApply}
                >
                    Apply Filters
                </button>

                {onReset && (
                    <button
                        className="button-primary my-2 w-full"
                        onClick={onReset}
                        type="button"
                    >
                        Reset Filters
                    </button>
                )}
            </div>
        </div>
    );
}