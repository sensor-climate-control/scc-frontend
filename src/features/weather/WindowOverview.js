import "./WindowOverview.css";
import WindowSection from "./WindowSection";

export default function WindowOverview(props) {
    return (
        <div className="outer-window-overview-wrapper">
            <div className="inner-window-overview-wrapper">
                <div className="window-overview-header">
                    <h1 className="window-overview-header-text">Overview</h1>
                </div>

                <hr className="window-overview-header-line" />

                <div className="window-overview-body">
                    {props.windows.map((window) => 
                        <WindowSection name={window.name} status={window.status} />
                    )}
                </div>
            </div>
        </div>
    );
}