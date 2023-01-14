const gulp = require("gulp")

exports.copyCSS = gulp.task("copyCSS", () => {
    return gulp.src("./src/**/*.css").pipe(gulp.dest("./lib"))
})

exports.copyImages = gulp.task("copyImages", () => {
    return gulp.src("./src/**/*.png").pipe(gulp.dest("./lib"))
})

exports.copyFiles = gulp.task("copyFiles", gulp.series(gulp.task("copyCSS"), gulp.task("copyImages")))
