-- Update existing wedding_info with proper Google Maps embed URLs
UPDATE wedding_info 
SET 
    akad_maps_url = 'https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3988.2339995101497!2d103.61586317496634!3d-1.61471919837025!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMcKwMzYnNTMuMCJTIDEwM8KwMzcnMDYuNCJF!5e0!3m2!1sid!2sid!4v1749149637257!5m2!1sid!2sid',
    resepsi_maps_url = 'https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3988.2339995101497!2d103.61586317496634!3d-1.61471919837025!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMcKwMzYnNTMuMCJTIDEwM8KwMzcnMDYuNCJF!5e0!3m2!1sid!2sid!4v1749149637258!5m2!1sid!2sid'
WHERE id IS NOT NULL;

-- Verify the update
SELECT 'Maps URLs updated successfully!' as message;

-- Show current maps URLs
SELECT 
    akad_venue_name,
    LEFT(akad_maps_url, 50) || '...' as akad_maps_preview,
    resepsi_venue_name,
    LEFT(resepsi_maps_url, 50) || '...' as resepsi_maps_preview,
    maps_display_option
FROM wedding_info;
