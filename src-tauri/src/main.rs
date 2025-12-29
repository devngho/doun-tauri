// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{
    fs::{self, File},
    io::{Read, Write},
    path::PathBuf,
};

extern crate dirs;
use cpal::traits::{DeviceTrait, HostTrait};
use rodio::{cpal, OutputStream};
use zip::ZipWriter;

#[tauri::command]
fn save_data(data: &str) -> bool {
    let mut file = File::create(get_data_file()).unwrap();
    return !file.write_all(data.as_bytes()).is_err();
}

#[tauri::command]
fn load_data(default: &str) -> String {
    let file = File::open(get_data_file());
    match file {
        Ok(mut f) => {
            let mut contents = String::new();
            let res = f.read_to_string(&mut contents);
            match res {
                Ok(_) => {
                    return contents;
                }
                Err(_) => {
                    return default.to_string();
                }
            }
        }
        Err(_) => {
            return default.to_string();
        }
    }
}

fn get_data_file() -> PathBuf {
    let mut data_dir = dirs::data_dir().unwrap();
    data_dir.push("doun-tauri");
    if !data_dir.exists() {
        let mut old_data_dir = dirs::data_dir().unwrap();
        old_data_dir.push("selfdie-with-doun-tauri");
        if old_data_dir.exists() {
            fs::rename(&old_data_dir, &data_dir).unwrap();
        } else {
            fs::create_dir(&data_dir).unwrap();
        }
    }
    data_dir.push("data.json");
    return data_dir;
}

#[tauri::command]
fn get_data_file_path() -> String {
    get_data_file().to_str().unwrap().to_string()
}

#[tauri::command]
fn check_is_dev() -> bool {
    cfg!(debug_assertions)
}

#[tauri::command]
fn get_audio_outputs() -> Vec<String> {
    let host = cpal::default_host();
    let devices = host.devices().unwrap();
    let res: Vec<String> = devices.into_iter().map(|x| x.name().unwrap()).collect();
    res
}

#[tauri::command]
fn get_default_audio_output() -> String {
    let host = cpal::default_host();
    let devices = host.default_output_device().unwrap();
    devices.name().unwrap()
}

#[tauri::command]
async fn play_audio(path: String, volume: f32, output: String) {
    let host = cpal::default_host();
    let devices = host.devices().unwrap();
    let device: rodio::Device = devices
        .into_iter()
        .find(|x| x.name().unwrap() == output)
        .unwrap()
        .into();
    let (_stream, stream_handle) = OutputStream::try_from_device(&device).unwrap();
    let sink = stream_handle.play_once(File::open(path).unwrap()).unwrap();
    sink.set_volume(volume);
    println!("Converted volume: {}", volume);
    sink.play();

    // Wait until the sound has finished playing.
    sink.sleep_until_end();
}

#[tauri::command]
async fn get_website_text(url: String) -> String {
    let res = reqwest::get(url).await;
    match res {
        Ok(res) => {
            let text = res.text().await;
            match text {
                Ok(text) => {
                    return text;
                }
                Err(_) => {
                    return "".to_string();
                }
            }
        }
        Err(_) => {
            return "".to_string();
        }
    }
}

#[tauri::command]
async fn call_command_line(command: String, args: Vec<String>) {
    let _ = std::process::Command::new(command).args(args).spawn();
}

#[tauri::command]
async fn make_zip(path: String, files: Vec<String>, data: String) {
    let file = File::create(path).unwrap();
    let mut zip = ZipWriter::new(file);

    for file_path in files {
        let path = std::path::Path::new(&file_path);
        let name = path.file_name().unwrap().to_str().unwrap();
        let options =
            zip::write::FileOptions::default().compression_method(zip::CompressionMethod::Deflated);
        zip.start_file(name, options).unwrap();
        let mut file = File::open(path).unwrap();
        let mut buffer = Vec::new();
        file.read_to_end(&mut buffer).unwrap();
        zip.write_all(&*buffer).unwrap();
    }

    let options =
        zip::write::FileOptions::default().compression_method(zip::CompressionMethod::Deflated);
    zip.start_file("data.json", options).unwrap();
    zip.write_all(data.as_bytes()).unwrap();

    zip.finish().unwrap();
}

#[tauri::command]
async fn load_zip(path: String) -> String {
    // unzip path file,
    // save it to data dir

    let mut data_dir = dirs::data_dir().unwrap();
    data_dir.push("doun-tauri");
    if !data_dir.exists() {
        let mut old_data_dir = dirs::data_dir().unwrap();
        old_data_dir.push("selfdie-with-doun-tauri");
        if old_data_dir.exists() {
            fs::rename(&old_data_dir, &data_dir).unwrap();
        } else {
            fs::create_dir(&data_dir).unwrap();
        }
    }
    let mut archive = zip::ZipArchive::new(File::open(path).unwrap()).unwrap();

    // save files
    // read from archive and save to data dir

    for i in 0..archive.len() {
        let mut file = archive.by_index(i).unwrap();
        let mut outpath = data_dir.clone();
        let filename = encoding_rs::UTF_8.decode(file.name_raw()).0.to_string();
        outpath.push(filename.clone());
        if file.name().contains("__MACOSX") {
            continue;
        }
        let mut outfile = File::create(&outpath).unwrap();
        std::io::copy(&mut file, &mut outfile).unwrap();
    }

    return data_dir.to_str().unwrap().to_string();
}

#[tauri::command]
async fn is_first_launch() -> bool {
    let mut data_dir = dirs::data_dir().unwrap();
    data_dir.push("doun-tauri");
    if !data_dir.exists() {
        return true;
    }
    data_dir.push("data.json");
    if !data_dir.exists() {
        return true;
    }
    return false;
}

fn main() {
    std::env::set_var("GDK_BACKEND", "wayland");
    
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            check_is_dev,
            save_data,
            load_data,
            play_audio,
            get_website_text,
            call_command_line,
            get_audio_outputs,
            get_default_audio_output,
            get_data_file_path,
            make_zip,
            load_zip,
            is_first_launch
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
