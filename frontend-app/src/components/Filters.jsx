import * as React from "react";

export default function Filters({ className, children, onApply, onReset }) {
    const handleSubmit = (e) => {
        e.preventDefault(); // prevent page reload
        onApply?.();
    };

    return (
        <div className={className}>
            <div className="rounded-md border">
                <h2 className='bg-[#1a1a1ad3] text-[#fff] p-[0.65rem] rounded-t text-center'>Filters</h2>

                {/* Wrap children in a form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-2">
                    {children}

                    <input type="submit" style={{ display: 'none' }} />
                </form>
            </div>

            <div className="flex gap-2">
                <button
                    className="bg-[#1a1a1ad3] text-[#fff] rounded-md p-2 my-2 w-full"
                    onClick={onApply}
                >
                    Apply Filters
                </button>

                {onReset && (
                    <button
                        className="bg-[#1a1a1ad3] text-[#fff] rounded-md p-2 my-2 w-full"
                        onClick={onReset}
                        type="button" // important so it doesn't submit the form
                    >
                        Reset Filters
                    </button>
                )}
            </div>
        </div>
    );
}