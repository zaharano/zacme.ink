<div>
  <h1 class="reddish">red text on teal</h1>
  <h1 class="purplish">hover me</h1>
  <h1 class="yellowish">yellow text on teal</h1>
</div>

<style type="text/scss">
  @import "color-schemer";
  @import "compass";
  @import url('https://fonts.googleapis.com/css?family=Galada|Limelight|Monoton|Press+Start+2P|Vast+Shadow');
  $background: hsl(176deg,60%,43%);
  @function getSign($val) {
    $r: null;
    @if $val==0 {
      $r: 0
    } @else {
      $r: $val/abs($val);
    }
    @return $r;
  }
  $h: 0;
  $v: 0;
  @function threeDHighlight($fill: #fff, $angle: 90deg) {
    $textShadow: null;
    $h: getSign(cos($angle)) !global;
    $v: getSign(sin($angle)) !global;
    $textShadow:
      cos(-1*$angle)+px sin(-1*$angle)+px 0 rgba(lighten($fill,10),0.95),
      -1*(cos(-1*$angle))+px (-1*(sin(-1*$angle)))+px 0 rgba(darken($fill,15),0.5),
    ;
    @return $textShadow;
  }
  @function threeDOutline($fill: #000, $angle: 90deg, $threeDObject: "") {
    $textShadow: null;
    $h: getSign(cos($angle)) !global;
    $v: getSign(sin($angle)) !global;
    @if ($threeDObject=="") {
      $textShadow: 
        1px 0 0 $fill,
        0 1px 0 $fill,
        -1px 0 0 $fill,
        0 -1px 0 $fill,
        1px 1px 0 $fill,
        -1px -1px 0 $fill,
        1px -1px 0 $fill,
        -1px 1px 0 $fill,
      ;
    } @else {
      $textShadow:
        cos(-1*$angle)+$h+px sin(-1*$angle)-$v+px 0 $fill,
        (-1*(cos(-1*$angle)+$h))+px (-1*(sin(-1*$angle)))+$v+px 0 $fill,
        cos($angle)+$h+px sin($angle)-$v+px 0 $fill,
        (-1*(cos($angle)+$h))+px (-1*(sin($angle)+$v))+px 0 $fill,      
      ;
      $textShadow: append($threeDObject,$textShadow,comma);
    }
    @return $textShadow;
  }
  @function threeDExtrude($angle: 90deg, $fill: #fff, $depth: 5px, $shadeDepth: 16, $layers: round($depth/($depth*0+1)), $threeDObject: "") {
    $textShadow: null;
    $strokeStep: $shadeDepth/$layers;
    @for $i from 1 to $layers+1 {
      $s: $i/$layers*$depth;
      $thisShadow: (-1*($s*cos($angle)-$h)) ($s*sin($angle)-($v)) 0 darken($fill, (($i)-1)*$strokeStep);
      $textShadow: append($textShadow, $thisShadow,comma);
    }
    @if ($threeDObject!="") {
      $textShadow: append($threeDObject, $textShadow,comma);
    }
    @return $textShadow;
  }
  @function threeDFullOutline($angle: 90deg, $fill: #000, $depth: 5px, $layers: round($depth/($depth*0+1)), $threeDObject: "") {
    $textShadow: 
      cos(-1*$angle)+$h+px sin(-1*$angle)-$v+px 0 $fill,
      (-1*(cos(-1*$angle)))+px (-1*(sin(-1*$angle)))+px 0 $fill
    ;
    @for $j from 1 to $layers+1 {
      $s: $j/$layers*$depth;
      $thisShadow:
        (-1*($s*cos($angle)-$h)+$h) $s*sin($angle) 0 $fill,
        // (-1*($s*cos($angle)-$h)-$h) $s*sin($angle) 0 $fill,
        (-1*($s*cos($angle)-$h)-$h) $s*sin($angle)-2*$v 0 $fill,
        // (-1*($s*cos($angle)-$h)+$h) $s*sin($angle)-2*$v 0 $fill,
      ;
      $textShadow: append($textShadow, $thisShadow,comma);
    }
    @if ($threeDObject!="") {
      $textShadow: append($threeDObject, $textShadow, comma);
    }
    @return $textShadow;
  }
  @function threeDBaseOutline($angle: 90deg, $fill: #000, $depth: 5px, $threeDObject: ""){
    $textShadow:
      -1*($depth*cos($angle)-$h)+1 $depth*sin($angle)-($v)-0 0 darken($fill,1),
      -1*($depth*cos($angle)-$h)-1 $depth*sin($angle)-($v)+1 0 darken($fill,1),
    ;
    @if ($threeDObject!=""){
      $textShadow: append($threeDObject,$textShadow,comma);
    }
    @return $textShadow;
  }
  @function threeDShadow($angle: 90deg, $dropAngle: $angle, $depth: 5px, $dropDepth: $depth, $threeDObject: "") {
    $textShadow:
      -1*($depth*cos($angle)/2+$depth*cos($dropAngle)/2) $depth*sin($angle)/2+$depth*sin($dropAngle)/2 1px rgba(0,0,0,0.1),
      0 0 5px rgba(0,0,0,.1),
      -1*(cos($angle))+px sin($angle)+px 3*sqrt($dropDepth/$depth)+px rgba(0,0,0,.3),
      -1*(cos($angle))+px sin($angle)+px 3*sqrt(2)+px rgba(0,0,0,.3),
      -1*(($dropDepth)-3)*(cos($dropAngle)) (($dropDepth)-3)*sin($dropAngle) 5px rgba(0,0,0,.2),
      -1*$depth*(cos($angle)) $depth*sin($angle) 2*$depth rgba(0,0,0,.25),
      -2*$dropDepth*(cos($dropAngle)) 2*$dropDepth*sin($dropAngle) 2*$dropDepth rgba(0,0,0,.2),
      -4*$dropDepth*(cos($dropAngle)) 4*$dropDepth*sin($dropAngle) 4*$dropDepth rgba(0,0,0,.15)
      ;
    @if ($threeDObject!="") {
      $textShadow: append($threeDObject,$textShadow,comma);
    }
    @return $textShadow;
  }

  .mythreed {
    $strokeColor: hsl(14,50,43);
    $fillColor: hsl(14,60,60);
    $thisAngle: 135deg;
    $fill: darken($fillColor,20);
    $outlineColor: rgba(hsl(hue($fill),saturation($fill),18),1);
    color: $fillColor;
    text-shadow:
      threeDShadow(
        $angle: $thisAngle,
        $depth: 10px,
        $dropDepth: 15px,
        $threeDObject:
        threeDFullOutline(
          $angle:$thisAngle,
          $depth: 10px,
          $layers: 8,
          $fill:$outlineColor,
          $threeDObject: 
            threeDExtrude(
              $depth:10px,
              $layers:8,
              $angle:$thisAngle,
              $fill:$fill,
              $threeDObject:
                threeDHighlight(
                  $angle:$thisAngle,
                  $fill:$fillColor
                )
            )
        )
      );
    // text-shadow: threedify(5px, $fill: $fillColor, $angle: 135deg, $baseOutline: false, $fullOutline: true, $layers: 3, $dropShadow: true, $highlight: true, $outline: false, $dropDepth: 15px);
    transition: text-shadow 0.5s ease-in-out;
  }
  .mythreed2 {
    position: relative;
    top: 0;
    $strokeColor: hsl(174,60,43);
    $fillColor: hsl(106,50,60);
    color: $fillColor;
    text-shadow:
      threeDBaseOutline(
        $angle: 90deg,
        $depth: 2px,
        $fill: darken($strokeColor,8),
      $threeDObject:
      threeDShadow(
        $angle: 90deg,
        $depth: 2px,
        $dropDepth: 1px,
        $threeDObject:
          threeDExtrude(
            $depth:2px,
            $angle:90deg,
            $layers: 8,
            $fill:$strokeColor,
            $threeDObject:
              threeDHighlight(
                $angle:90deg,
                $fill:$fillColor
              )
          )
      ));
    transition: all 0.2s ease-in-out;
    &:hover {
      position: relative;
      top: -16px;
      color: $fillColor;
      text-shadow:
      threeDBaseOutline(
        $angle: 90deg,
        $depth: 18px,
        $fill: darken($strokeColor,8),
        $threeDObject:
      threeDShadow(
        $angle: 90deg,
        $dropAngle: 90deg,
        $depth: 18px,
        $dropDepth: 18px,
        $threeDObject:
          threeDExtrude(
            $depth:18px,
            $layers: 8,
            $angle:90deg,
            $fill:$strokeColor,
            $threeDObject:
              threeDHighlight(
                $angle:90deg,
                $fill:lighten($fillColor,6)
              )
          ))
      );
      // text-shadow: threedify(8px, $fill: $fillColor, $angle: 90deg, $outline: false, $baseOutline: false, $fullOutline: false, $stroke: $strokeColor, $highlight: true, $dropShadow: true, $dropAngle: 60deg);
      transition: all 0.2s ease-in-out;
    }
  }
  .mythreed3 {
    $strokeColor: hsl(14,50,43);
    $fillColor: hsl(116,50,43);
    color: #eee;
    // text-shadow: threedify(10px, $fill: #fff, $angle: 45deg, $outline: true, $baseOutline: true, $fullOutline: true, $stroke: #ccc, $dropShadow: true, $highlight: false, $dropDepth: 18px);
  }
  .papercut {
    $strokeColor: hsl(174,60,43);
    $fillColor: hsl(106,50,60);
    color: #fff0f0;
    // text-shadow: threedify($fill: #fff0f0, $outline: true, $baseOutline: true, $stroke: $background, $layers: 4, $shadeDepth: 20, $depth: 12px, $angle: 135deg, $fullOutline: true, $dropShadow: true);
  }
  .anotha {
    font-size: 200px;
    // text-shadow: threedify($depth: 20px, $angle: 0deg, $outline: true, $fullOutline: true, $layers: 10, $dropShadow: true);
  }
  .juicy {
    color: #ddd;
    // text-shadow: threedify($fill: #ddd, $fullOutline: true, $angle: -60deg, $highlight: true, $layers: 10, $depth: 10px, $outline: false, $dropShadow: true, $dropAngle: 120deg, $dropDepth: 11px)
  }
  body {
    background: $background;
    padding: 0;
  }
  small {
    font-size: 0.5em;
  }
  h1, h2 {
    font-family: Galada;
    color: hsl(176,60,35);
    font-size: 150px;
    text-align: center;
    line-height: 0.8em;
    cursor: default;
  }
  h2 {
    font-family: 'Open Sans';
  }
  h2::after {
    content: ' \2026' 
  }
  h3 {
    color: hsla(176,0,92,1);
    font-family: 'Slabo 27px';
    font-size: 40px;
    text-align: center;
  }
  p {
    text-align: center;
    color: hsl(36,90,20);
    font-family: 'Open Sans';
    font-weight: 600;
    text-shadow: 1px 1px 0 hsl(36,90,50),
      -1px -1px 0px hsl(36,90,40);
  }
  .onemore {
    color: #ddd;
    // text-shadow: threedify($depth: 20px, $angle: 147deg, $outline: true, $baseOutline: true, $dropDepth: 28px, $fullOutline: true);
    font-family: Arial;
  }
  .teal {
    background: #35b6af;
  }
  .reddish {
    $thisAngle: 90deg;
    $thisFill: #e95935;
    $thisDepth: 8px;
    color: #e95935;
    text-shadow: 
      threeDShadow(
        $angle:$thisAngle,
        $depth:$thisDepth,
        $threeDObject:
          threeDExtrude(
            $depth: $thisDepth, 
            $fill: darken(#e95935,20), 
            $angle: $thisAngle, 
            $threeDObject:
              threeDHighlight(
                $angle: $thisAngle, 
                $fill: #e95935
              )
          )
      )
    ;
  }
  .purplish {
    font-family: Monoton;
    line-height: 1em;
    font-weight: normal;
    $thisAngle: 270deg;
    $thisDepth: 7px;
    $thisFill: #9b76cd;
    color: #9b76cd;
    text-shadow: 
      threeDShadow(
        $angle:$thisAngle,
        $depth:20px,
        $dropAngle: 315deg,
        $threeDObject:
          threeDExtrude(
            $depth: $thisDepth, 
            $fill: darken($thisFill,20), 
            $layers: 5, 
            $angle: $thisAngle, 
            $threeDObject:
              threeDHighlight(
                $angle: 315deg, 
                $fill: $thisFill
              )
          )
      )
    ;
    &:hover {
      text-shadow: 
      threeDShadow(
        $angle:$thisAngle,
        $depth:$thisDepth,
        $dropDepth: 10px,
        $dropAngle: 220deg,
        $threeDObject:
          threeDExtrude(
            $depth: 7px, 
            $fill: darken($thisFill,20), 
            $layers: 5, 
            $angle: $thisAngle, 
            $threeDObject:
              threeDHighlight(
                $angle: 220deg, 
                $fill: $thisFill
              )
          )
      )
    ;
      //transform: perspective(600px) rotateY(-30deg);
      transition: all 0.5s ease-in-out;
    }
    transition: all 0.5s ease-in-out;
    //text-shadow: threedify($fill: #9b76cd, $fullOutline: false, $angle: 120deg, $highlight: true, $layers: 3, $depth: 7px, $outline: false, $dropShadow: true, $dropAngle: 120deg, $dropDepth: 14px )
  }
  .yellowish {
    $thisFill: #edc420;
    $thisDepth: 12px;
    $thisAngle: 135deg;
    color: #edc420;
    text-shadow: 
      
        threeDShadow(
          $depth: $thisDepth,
          $angle: $thisAngle,
          $threeDObject:
          threeDFullOutline(
          $depth: $thisDepth,
          $layers: 5,
          $angle: $thisAngle,
          $threeDObject:
          threeDExtrude(
            $depth: $thisDepth, 
            $fill: #9b76cd, 
            $layers: 5,
            $shadeDepth: 5,
            $angle: $thisAngle,
            $threeDObject:
            threeDOutline(
              $fill: darken($thisFill,50)
            )
      )))
    ;
  }
</style>