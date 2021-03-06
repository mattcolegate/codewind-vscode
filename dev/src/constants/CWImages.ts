/*******************************************************************************
 * Copyright (c) 2020 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v20.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/

import { Uri } from "vscode";
import * as fs from "fs-extra";
import * as path from "path";
import Log from "../Logger";
import CWExtensionContext from "../CWExtensionContext";

// non-nls-file

export const RES_FOLDER_NAME = "res";
const IMG_FOLDER_NAME = "img";
const LIGHT_FOLDER_NAME = "light";
const DARK_FOLDER_NAME = "dark";
const THEMELESS_FOLDER_NAME = "themeless";

interface IconPaths {
    readonly dark: Uri;
    readonly light: Uri;
}

function getBaseImagePath(): string {
    return path.join(CWExtensionContext.get().resourcesPath, IMG_FOLDER_NAME);
}

async function checkExists(...paths: string[]): Promise<void> {
    paths.forEach(async (imagePath) => {
        try {
            await fs.access(imagePath, fs.constants.R_OK);
            // Log.d(`Loaded image: ${imagePath}`);
        }
        catch (err) {
            Log.e(`Missing icon! ${imagePath}`);
        }
    });
}

/**
 * Represents an image that the extension packages.
 * Images are loaded lazily (when requested). If an image is missing, an error is logged when loading fails.
 */
export class CWImage {

    private _paths: IconPaths | undefined;

    constructor(
        /**
         * true to look under dark/ and light/, false for themeless/
         */
        private readonly themed: boolean,
        /**
         * Filename under one of the above theme folders. Assumes an SVG extension if not given.
         */
        private readonly filename: string,
    ) {
        if (!path.extname(filename)) {
            this.filename = filename + ".svg";
        }
    }

    public get paths(): IconPaths {
        if (!this._paths) {
            const basePath = getBaseImagePath();

            let darkPath: string;
            let lightPath: string;
            if (this.themed) {
                darkPath = path.join(basePath, DARK_FOLDER_NAME, this.filename);
                lightPath = path.join(basePath, LIGHT_FOLDER_NAME, this.filename);
                checkExists(darkPath, lightPath);
            }
            else {
                darkPath = lightPath = path.join(basePath, THEMELESS_FOLDER_NAME, this.filename);
                checkExists(darkPath);
            }

            this._paths = {
                dark: Uri.file(darkPath),
                light: Uri.file(lightPath)
            };

            // Log.d(`Loaded ${this.themed ? "themed " : ""}image ${this.filename}`);
        }
        return this._paths;
    }
}

export const ThemedImages = {
    Connection_Connected:       new CWImage(true, "connection_connected"),
    Connection_Disconnected:    new CWImage(true, "connection_disconnected"),
    New_Connection:     new CWImage(true, "new_connection"),
    Local_Connected:    new CWImage(true, "local_connected"),
    Local_Disconnected: new CWImage(true, "local_disconnected"),

    Bind:   new CWImage(true, "bind"),
    Copy:   new CWImage(true, "copy"),
    Error:  new CWImage(true, "error"),
    Edit:   new CWImage(true, "edit"),
    Filter: new CWImage(true, "filter"),
    Help:   new CWImage(true, "help"),
    Info:   new CWImage(true, "info"),
    New:    new CWImage(true, "new"),
    Save:   new CWImage(true, "save"),

    Extensions: new CWImage(true, "extensions"),
    Launch:     new CWImage(true, "launch"),
    Play:       new CWImage(true, "play"),
    Refresh:    new CWImage(true, "refresh"),

    Server_Error:       new CWImage(true, "server_error"),
    Split_Horizontal:   new CWImage(true, "split_horizontal"),

    Stop:       new CWImage(true, "stop"),
    Trash:      new CWImage(true, "trash"),
    Warning:    new CWImage(true, "warning"),
};

export const ThemelessImages = {
    Logo:       new CWImage(false, "codewind"),
    Download:   new CWImage(false, "download"),

    Connected_Checkmark:    new CWImage(false, "connection_connected_checkmark"),
    Disconnected_Checkmark: new CWImage(false, "connection_disconnected_checkmark"),
    ToggleOnThin:     new CWImage(false, "toggle_on_thin"),
    ToggleOffThin:    new CWImage(false, "toggle_off_thin"),

    Warning: new CWImage(false, "warning"),
    Welcome_Screenshot: new CWImage(false, "welcome_screenshot.png"),
};

export const ProjectTypeImages = {
    Generic:        new CWImage(false, "project-types/generic"),
    Go:             new CWImage(false, "project-types/go"),
    Java:           new CWImage(false, "project-types/java"),
    Microprofile:   new CWImage(false, "project-types/microprofile"),
    NodeJS:         new CWImage(false, "project-types/nodejs"),
    Python:         new CWImage(false, "project-types/python"),
    Spring:         new CWImage(false, "project-types/spring"),
    Swift:          new CWImage(false, "project-types/swift"),
};

// https://octicons.github.com/
export enum Octicons {
    sync = "sync",
    bug = "bug",
    cloud_upload = "cloud-upload",
}

/**
 * Get a string which can be included in a status bar message to render an octicon.
 * The returned value will be "$(iconName)" or "$(iconName~spin)"
 *
 * @param iconName - One of the octicons from https://octicons.github.com
 */
export function getOcticon(iconName: Octicons, spinning: boolean = false): string {
    return `$(${iconName}${spinning ? "~spin" : ""})`;
}
